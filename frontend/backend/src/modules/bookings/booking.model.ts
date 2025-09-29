import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { User } from '../users/user.model';
import { Flight } from '../flights/flight.model';
import { CabinClass } from '../classes/class.model';
import { BookingSeat } from './booking-seat.model';
import { BookingPassenger } from './booking-passenger.model';

@Table({ tableName: 'bookings' })
export class Booking extends Model<Booking, Partial<Booking>> {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  id!: number;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  userId!: number;

  @BelongsTo(() => User) user!: User;

  @ForeignKey(() => Flight)
  @Column(DataType.INTEGER)
  flightId!: number;

  @BelongsTo(() => Flight) flight!: Flight;

  @ForeignKey(() => Flight)
  @Column({ type: DataType.INTEGER, allowNull: true })
  returnFlightId!: number | null;

  @BelongsTo(() => Flight, { foreignKey: 'returnFlightId', as: 'returnFlight' })
  returnFlight!: Flight | null;

  @ForeignKey(() => CabinClass)
  @Column(DataType.INTEGER)
  classId!: number;

  @BelongsTo(() => CabinClass) cabinClass!: CabinClass;

  @Column({ type: DataType.STRING, defaultValue: 'PENDING' })
  status!: 'PENDING' | 'CONFIRMED' | 'CANCELLED';

  @Column(DataType.STRING)
  pnr!: string;

  @Column({ type: DataType.DECIMAL(10,2), defaultValue: 0 })
  totalPrice!: string;

  @HasMany(() => BookingSeat) seats!: BookingSeat[];
  @HasMany(() => BookingPassenger) passengers!: BookingPassenger[];
}
