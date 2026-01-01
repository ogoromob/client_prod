import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { InvestmentEntity, InvestmentStatus, PoolEntity, PoolStatus, UserEntity } from '../../database/entities';
import { CreateInvestmentDto } from './dto/investment.dto';

@Injectable()
export class InvestmentService {
  constructor(
    @InjectRepository(InvestmentEntity)
    private investmentRepository: Repository<InvestmentEntity>,
    @InjectRepository(PoolEntity)
    private poolRepository: Repository<PoolEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async create(createDto: CreateInvestmentDto, userId: string, manager?: EntityManager): Promise<InvestmentEntity> {
    const repo = manager ? manager.getRepository(InvestmentEntity) : this.investmentRepository;
    const poolRepo = manager ? manager.getRepository(PoolEntity) : this.poolRepository;
    const userRepo = manager ? manager.getRepository(UserEntity) : this.userRepository;

    // 1. Vérifier l'abonnement de l'utilisateur
    const user = await userRepo.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    if (!user.isSubscriptionActive) {
      throw new ForbiddenException(
        'Abonnement requis. Veuillez payer les frais de souscription de 2$ pour investir.'
      );
    }

    const pool = await poolRepo.findOne({ where: { id: createDto.poolId } });
    
    if (!pool) {
      throw new NotFoundException('Pool non trouvé');
    }

    if (pool.status !== PoolStatus.PENDING && pool.status !== PoolStatus.ACTIVE) {
      throw new BadRequestException('Ce pool n\'accepte plus d\'investissements');
    }

    // 2. Vérifier la fenêtre de 48h pour la validation
    const validationDeadline = new Date(pool.startDate);
    validationDeadline.setHours(validationDeadline.getHours() + 48);

    if (new Date() > validationDeadline) {
      throw new BadRequestException('La période de validation pour ce pool est terminée (48h rule).');
    }

    if (createDto.amount < Number(pool.minInvestment)) {
      throw new BadRequestException(`Montant minimum: ${pool.minInvestment}€`);
    }

    const investment = repo.create({
      poolId: createDto.poolId,
      userId,
      initialAmount: createDto.amount,
      currentValue: createDto.amount,
      pnl: 0,
      pnlPercentage: 0,
      status: InvestmentStatus.CONFIRMED,
      investedAt: new Date(),
      paymentMethod: createDto.paymentMethod,
    });

    const saved = await repo.save(investment);

    // Update pool amounts (atomique avec la transaction)
    pool.currentAmount = Number(pool.currentAmount) + createDto.amount;
    pool.totalInvested = Number(pool.totalInvested) + createDto.amount;
    await poolRepo.save(pool);

    return saved;
  }

  async findMyInvestments(userId: string): Promise<InvestmentEntity[]> {
    return await this.investmentRepository.find({
      where: { userId },
      relations: ['pool'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId?: string): Promise<InvestmentEntity> {
    const investment = await this.investmentRepository.findOne({
      where: { id },
      relations: ['pool', 'user'],
    });

    if (!investment) {
      throw new NotFoundException('Investissement non trouvé');
    }

    if (userId && investment.userId !== userId) {
      throw new ForbiddenException('Accès refusé');
    }

    return investment;
  }

  async getHistory(id: string, userId: string) {
    const investment = await this.findOne(id, userId);
    
    // Mock history
    const history: Array<{timestamp: string, value: number, pnl: number, pnlPercentage: number}> = [];
    const now = new Date();
    const initial = Number(investment.initialAmount);
    const current = Number(investment.currentValue);
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const progress = (30 - i) / 30;
      const value = initial + ((current - initial) * progress);
      
      history.push({
        timestamp: date.toISOString(),
        value,
        pnl: value - initial,
        pnlPercentage: ((value - initial) / initial) * 100,
      });
    }
    
    return history;
  }

  async confirm(id: string, userId: string): Promise<InvestmentEntity> {
    const investment = await this.findOne(id, userId);
    
    if (investment.status !== InvestmentStatus.PENDING) {
      throw new BadRequestException('Cet investissement ne peut pas être confirmé');
    }

    investment.status = InvestmentStatus.CONFIRMED;
    investment.confirmedAt = new Date();
    return await this.investmentRepository.save(investment);
  }

  async reject(id: string, userId: string, reason?: string): Promise<InvestmentEntity> {
    const investment = await this.findOne(id, userId);
    
    if (investment.status !== InvestmentStatus.PENDING) {
      throw new BadRequestException('Cet investissement ne peut pas être rejeté');
    }

    investment.status = InvestmentStatus.REJECTED;
    investment.rejectedAt = new Date();
    investment.rejectionReason = reason || null;

    // Rembourser l'utilisateur
    const pool = await this.poolRepository.findOne({ where: { id: investment.poolId } });
    if (pool) {
      pool.currentAmount = Number(pool.currentAmount) - Number(investment.initialAmount);
      pool.totalInvested = Number(pool.totalInvested) - Number(investment.initialAmount);
      await this.poolRepository.save(pool);
    }

    return await this.investmentRepository.save(investment);
  }

  async getPendingInvestments(): Promise<InvestmentEntity[]> {
    return await this.investmentRepository.find({
      where: { status: InvestmentStatus.PENDING },
      relations: ['user', 'pool'],
      order: { createdAt: 'ASC' },
    });
  }

  async getAllInvestments(): Promise<InvestmentEntity[]> {
    return await this.investmentRepository.find({
      relations: ['user', 'pool'],
      order: { createdAt: 'DESC' },
    });
  }

  async approveInvestment(id: string): Promise<InvestmentEntity> {
    const investment = await this.investmentRepository.findOne({ where: { id } });
    
    if (!investment) {
      throw new NotFoundException('Investissement non trouvé');
    }

    if (investment.status !== InvestmentStatus.PENDING) {
      throw new BadRequestException('Cet investissement ne peut pas être approuvé');
    }

    investment.status = InvestmentStatus.CONFIRMED;
    investment.confirmedAt = new Date();
    return await this.investmentRepository.save(investment);
  }

  async rejectInvestmentAdmin(id: string, reason: string): Promise<InvestmentEntity> {
    const investment = await this.investmentRepository.findOne({ where: { id } });
    
    if (!investment) {
      throw new NotFoundException('Investissement non trouvé');
    }

    if (investment.status !== InvestmentStatus.PENDING) {
      throw new BadRequestException('Cet investissement ne peut pas être rejeté');
    }

    investment.status = InvestmentStatus.REJECTED;
    investment.rejectedAt = new Date();
    investment.rejectionReason = reason;

    // Rembourser l'utilisateur
    const pool = await this.poolRepository.findOne({ where: { id: investment.poolId } });
    if (pool) {
      pool.currentAmount = Number(pool.currentAmount) - Number(investment.initialAmount);
      pool.totalInvested = Number(pool.totalInvested) - Number(investment.initialAmount);
      await this.poolRepository.save(pool);
    }

    return await this.investmentRepository.save(investment);
  }
}
