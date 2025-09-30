import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Booking } from './booking.model';

@Table({ tableName: 'booking_passengers' })
export class BookingPassenger extends Model<BookingPassenger, Partial<BookingPassenger>> {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  id!: number;

  @ForeignKey(() => Booking)
  @Column(DataType.INTEGER)
  bookingId!: number;

  @BelongsTo(() => Booking) booking!: Booking;

  @Column(DataType.STRING) firstName!: string;
  @Column(DataType.STRING) lastName!: string;
  @Column(DataType.STRING) documentNumber!: string;
}
