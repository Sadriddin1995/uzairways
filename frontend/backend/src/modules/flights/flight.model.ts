import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Company } from '../companies/company.model';
import { Plane } from '../planes/plane.model';
import { Airport } from '../geo/airport.model';
import { Booking } from '../bookings/booking.model';
import { Review } from '../reviews/review.model';

@Table({ tableName: 'flights' })
export class Flight extends Model<Flight, Partial<Flight>> {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  id!: number;

  @ForeignKey(() => Company)
  @Column(DataType.INTEGER)
  companyId!: number;

  @BelongsTo(() => Company) company!: Company;

  @ForeignKey(() => Plane)
  @Column(DataType.INTEGER)
  planeId!: number;

  @BelongsTo(() => Plane) plane!: Plane;

  @ForeignKey(() => Airport)
  @Column(DataType.INTEGER)
  originAirportId!: number;

  @BelongsTo(() => Airport, { foreignKey: 'originAirportId', as: 'origin' })
  origin!: Airport;

  @ForeignKey(() => Airport)
  @Column(DataType.INTEGER)
  destinationAirportId!: number;

  @BelongsTo(() => Airport, { foreignKey: 'destinationAirportId', as: 'destination' })
  destination!: Airport;

  @Column({ type: DataType.STRING, unique: true })
  flightNumber!: string;

  @Column(DataType.DATE)
  departureTime!: Date;

  @Column(DataType.DATE)
  arrivalTime!: Date;

  @Column({ type: DataType.DECIMAL(10,2), defaultValue: 0 })
  basePrice!: string;

  @Column({ type: DataType.STRING, defaultValue: 'SCHEDULED' })
  status!: 'SCHEDULED' | 'CANCELLED';

  @Column({ type: DataType.JSONB, field: 'class_pricing', allowNull: true })
  classPricing?: { classId: number; price?: string; seatLimit?: number }[] | null;

  @HasMany(() => Booking) bookings!: Booking[];
  @HasMany(() => Review) reviews!: Review[];
}
