import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../database/entities';
import { SecurityService } from './security.service';
import { SecurityController } from './security.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [SecurityService],
  controllers: [SecurityController],
  exports: [SecurityService],
})
export class SecurityModule {}
