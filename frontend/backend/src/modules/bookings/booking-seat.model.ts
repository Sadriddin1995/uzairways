import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Booking } from './booking.model';
import { Seat } from '../seats/seat.model';
import { Flight } from '../flights/flight.model';

@Table({ tableName: 'booking_seats' })
export class BookingSeat extends Model<BookingSeat, Partial<BookingSeat>> {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  id!: number;

  @ForeignKey(() => Booking)
  @Column(DataType.INTEGER)
  bookingId!: number;

  @BelongsTo(() => Booking) booking!: Booking;

  @ForeignKey(() => Flight)
  @Column(DataType.INTEGER)
  flightId!: number;

  @BelongsTo(() => Flight) flight!: Flight;

  @ForeignKey(() => Seat)
  @Column(DataType.INTEGER)
  seatId!: number;

  @BelongsTo(() => Seat) seat!: Seat;
}
