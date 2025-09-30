import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Plane } from '../planes/plane.model';
import { CabinClass } from '../classes/class.model';
import { BookingSeat } from '../bookings/booking-seat.model';

@Table({ tableName: 'seats' })
export class Seat extends Model<Seat, Partial<Seat>> {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  id!: number;

  @ForeignKey(() => Plane)
  @Column(DataType.INTEGER)
  planeId!: number;

  @BelongsTo(() => Plane) plane!: Plane;

  @ForeignKey(() => CabinClass)
  @Column(DataType.INTEGER)
  classId!: number;

  @BelongsTo(() => CabinClass) cabinClass!: CabinClass;

  @Column(DataType.STRING)
  seatNumber!: string; 

  @Column(DataType.INTEGER)
  row!: number;

  @Column(DataType.STRING)
  col!: string; 

  @HasMany(() => BookingSeat) bookingSeats!: BookingSeat[];
}
