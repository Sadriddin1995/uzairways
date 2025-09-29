import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Plane } from '../planes/plane.model';
import { Flight } from '../flights/flight.model';

@Table({ tableName: 'companies' })
export class Company extends Model<Company, Partial<Company>> {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  id!: number;

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.STRING)
  code!: string;

  @HasMany(() => Plane) planes!: Plane[];
  @HasMany(() => Flight) flights!: Flight[];
}
