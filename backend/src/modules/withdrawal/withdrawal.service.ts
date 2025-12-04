import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WithdrawalEntity, WithdrawalStatus, InvestmentEntity, InvestmentStatus } from '../../database/entities';
import { CreateWithdrawalDto } from './dto/withdrawal.dto';

@Injectable()
export class WithdrawalService {
  constructor(
    @InjectRepository(WithdrawalEntity)
    private withdrawalRepository: Repository<WithdrawalEntity>,
    @InjectRepository(InvestmentEntity)
    private investmentRepository: Repository<InvestmentEntity>,
  ) {}

  async create(createDto: CreateWithdrawalDto, userId: string): Promise<WithdrawalEntity> {
    const investment = await this.investmentRepository.findOne({
      where: { id: createDto.investmentId },
      relations: ['pool'],
    });

    if (!investment || investment.userId !== userId) {
      throw new NotFoundException('Investissement non trouvé');
    }

    if (investment.status !== InvestmentStatus.WITHDRAWABLE) {
      throw new BadRequestException('Retrait non autorisé pour cet investissement');
    }

    if (createDto.amount > Number(investment.currentValue)) {
      throw new BadRequestException('Montant supérieur au solde disponible');
    }

    const managerFee = createDto.amount * 0.15; // 15% fee
    const netAmount = createDto.amount - managerFee;

    const withdrawal = this.withdrawalRepository.create({
      investmentId: createDto.investmentId,
      userId,
      amount: createDto.amount,
      managerFee,
      netAmount,
      status: WithdrawalStatus.PENDING,
      withdrawalMethod: createDto.withdrawalMethod,
      destinationAddress: createDto.destinationAddress,
    });

    const saved = await this.withdrawalRepository.save(withdrawal);

    // Update investment status
    investment.status = InvestmentStatus.WITHDRAWAL_PENDING;
    await this.investmentRepository.save(investment);

    return saved;
  }

  async findMyWithdrawals(userId: string): Promise<WithdrawalEntity[]> {
    return await this.withdrawalRepository.find({
      where: { userId },
      relations: ['investment', 'investment.pool'],
      order: { requestedAt: 'DESC' },
    });
  }

  async findOne(id: string, userId?: string): Promise<WithdrawalEntity> {
    const withdrawal = await this.withdrawalRepository.findOne({
      where: { id },
      relations: ['investment', 'investment.pool'],
    });

    if (!withdrawal) {
      throw new NotFoundException('Retrait non trouvé');
    }

    if (userId && withdrawal.userId !== userId) {
      throw new ForbiddenException('Accès refusé');
    }

    return withdrawal;
  }

  async calculateFees(investmentId: string, amount: number) {
    const feePercentage = 15;
    const managerFee = amount * (feePercentage / 100);
    const netAmount = amount - managerFee;

    return {
      amount,
      managerFee,
      netAmount,
      feePercentage,
    };
  }

  async findAllPending(): Promise<WithdrawalEntity[]> {
    return await this.withdrawalRepository.find({
      where: { status: WithdrawalStatus.PENDING },
      relations: ['investment', 'investment.pool', 'user'],
      order: { requestedAt: 'ASC' },
    });
  }

  async approve(id: string): Promise<WithdrawalEntity> {
    const withdrawal = await this.withdrawalRepository.findOne({
      where: { id },
      relations: ['investment'],
    });

    if (!withdrawal) {
      throw new NotFoundException('Retrait non trouvé');
    }

    if (withdrawal.status !== WithdrawalStatus.PENDING) {
      throw new BadRequestException('Ce retrait a déjà été traité');
    }

    withdrawal.status = WithdrawalStatus.APPROVED;
    withdrawal.processedAt = new Date();

    const saved = await this.withdrawalRepository.save(withdrawal);

    // Update investment
    const investment = await this.investmentRepository.findOne({
      where: { id: withdrawal.investmentId },
    });

    if (investment) {
      investment.status = InvestmentStatus.WITHDRAWN;
      investment.withdrawnAt = new Date();
      await this.investmentRepository.save(investment);
    }

    return saved;
  }

  async reject(id: string, reason: string): Promise<WithdrawalEntity> {
    const withdrawal = await this.withdrawalRepository.findOne({
      where: { id },
      relations: ['investment'],
    });

    if (!withdrawal) {
      throw new NotFoundException('Retrait non trouvé');
    }

    if (withdrawal.status !== WithdrawalStatus.PENDING) {
      throw new BadRequestException('Ce retrait a déjà été traité');
    }

    withdrawal.status = WithdrawalStatus.REJECTED;
    withdrawal.processedAt = new Date();
    withdrawal.rejectionReason = reason;

    const saved = await this.withdrawalRepository.save(withdrawal);

    // Reset investment status
    const investment = await this.investmentRepository.findOne({
      where: { id: withdrawal.investmentId },
    });

    if (investment) {
      investment.status = InvestmentStatus.WITHDRAWABLE;
      await this.investmentRepository.save(investment);
    }

    return saved;
  }
}
