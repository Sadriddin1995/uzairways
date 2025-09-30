import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from '../users/user.model';
import { Booking } from '../bookings/booking.model';

@Table({ tableName: 'loyalty_transactions' })
export class LoyaltyTransaction extends Model<LoyaltyTransaction, Partial<LoyaltyTransaction>> {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  id!: number;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  userId!: number;

  @BelongsTo(() => User) user!: User;

  @ForeignKey(() => Booking)
  @Column({ type: DataType.INTEGER, allowNull: true })
  bookingId!: number | null;

  @BelongsTo(() => Booking) booking!: Booking | null;

  @Column(DataType.INTEGER)
  points!: number;

  @Column(DataType.STRING)
  type!: 'EARN' | 'REDEEM';
}
