import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { City } from '../cities/city.model';

@Table({ tableName: 'countries' })
export class Country extends Model<Country, Partial<Country>> {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  id!: number;

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.STRING)
  isoCode!: string;

  @HasMany(() => City) cities!: City[];
}
