import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { LoyaltyTransaction } from './loyalty-transaction.model';
import { LoyaltyService } from './loyalty.service';
import { LoyaltyController } from './loyalty.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [SequelizeModule.forFeature([LoyaltyTransaction]), UsersModule],
  providers: [LoyaltyService],
  controllers: [LoyaltyController],
  exports: [LoyaltyService, SequelizeModule],
})
export class LoyaltyModule {}
