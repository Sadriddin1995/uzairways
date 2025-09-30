import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { LoyaltyTransaction } from './loyalty-transaction.model';
import { UsersService } from '../users/users.service';

@Injectable()
export class LoyaltyService {
  constructor(@InjectModel(LoyaltyTransaction) private ltModel: typeof LoyaltyTransaction, private users: UsersService) {}

  async earn(userId: number, bookingId: number, amountUSD: number) {
    const pts = Math.floor(amountUSD * 5);
    await this.ltModel.create({ userId, bookingId, points: pts, type: 'EARN' });
    const user = await this.users.findById(userId);
    if (user) {
      user.loyaltyPoints += pts;
      user.loyaltyTier = this.computeTier(user.loyaltyPoints);
      await user.save();
    }
  }

  computeTier(points: number): 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' {
    if (points >= 50000) return 'PLATINUM';
    if (points >= 20000) return 'GOLD';
    if (points >= 5000) return 'SILVER';
    return 'BRONZE';
  }

  history(userId: number) {
    return this.ltModel.findAll({ where: { userId } });
  }
}
