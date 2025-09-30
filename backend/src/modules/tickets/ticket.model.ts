import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from '../users/user.model';
import { Booking } from '../bookings/booking.model';

@Table({ tableName: 'ticket_payments' })
export class TicketPayment extends Model<TicketPayment, Partial<TicketPayment>> {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  id!: number;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  userId!: number;

  @BelongsTo(() => User) user!: User;

  @ForeignKey(() => Booking)
  @Column(DataType.INTEGER)
  bookingId!: number;

  @BelongsTo(() => Booking) booking!: Booking;

  @Column({ type: DataType.DECIMAL(10,2), defaultValue: 0 })
  amount!: string; 

  @Column({ type: DataType.STRING, defaultValue: 'PAID' })
  status!: 'PAID' | 'REFUNDED' | 'CANCELLED';
}
