import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Seat } from '../seats/seat.model';
import { Booking } from '../bookings/booking.model';

@Table({ tableName: 'classes' })
export class CabinClass extends Model<CabinClass, Partial<CabinClass>> {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  id!: number;

  @Column(DataType.STRING)
  name!: string; 

  @Column(DataType.STRING)
  code!: string; 

  @Column({ type: DataType.FLOAT, defaultValue: 1 })
  priceMultiplier!: number; 

  @HasMany(() => Seat) seats!: Seat[];
  @HasMany(() => Booking) bookings!: Booking[];
}
