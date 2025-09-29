import { Table, Column, Model, DataType, AllowNull, Unique, HasMany, Default } from 'sequelize-typescript';
import { Booking } from '../bookings/booking.model';
import { Review } from '../reviews/review.model';
import { LoyaltyTransaction } from '../loyalty/loyalty-transaction.model';

@Table({ tableName: 'users' })
export class User extends Model<User, Partial<User>> {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  id!: number;

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING)
  email!: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING, field: 'password_hash' })
  passwordHash!: string;

  @AllowNull(false)
  @Default('USER')
  @Column(DataType.STRING)
  role!: 'USER' | 'ADMIN' | 'SUPER_ADMIN';

  @AllowNull(true)
  @Column(DataType.STRING)
  fullName!: string | null;

  @Default(0)
  @Column({ type: DataType.INTEGER, field: 'loyalty_points' })
  loyaltyPoints!: number;

  @Default('BRONZE')
  @Column({ type: DataType.STRING, field: 'loyalty_tier' })
  loyaltyTier!: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

  @HasMany(() => Booking) bookings!: Booking[];
  @HasMany(() => Review) reviews!: Review[];
  @HasMany(() => LoyaltyTransaction) loyaltyTransactions!: LoyaltyTransaction[];

  @Default(0)
  @Column({ type: DataType.DECIMAL(10,2), field: 'balance' })
  balance!: string; 
}
