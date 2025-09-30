import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { City } from '../cities/city.model';

@Table({ tableName: 'airports' })
export class Airport extends Model<Airport, Partial<Airport>> {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  id!: number;

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.STRING)
  iata!: string;

  @ForeignKey(() => City)
  @Column(DataType.INTEGER)
  cityId!: number;

  @BelongsTo(() => City) city!: City;
}
