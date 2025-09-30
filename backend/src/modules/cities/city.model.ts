import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Country } from '../geo/country.model';
import { Airport } from '../geo/airport.model';

@Table({ tableName: 'cities' })
export class City extends Model<City, Partial<City>> {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  id!: number;

  @Column(DataType.STRING)
  name!: string;

  @ForeignKey(() => Country)
  @Column(DataType.INTEGER)
  countryId!: number;

  @BelongsTo(() => Country) country!: Country;
  @HasMany(() => Airport) airports!: Airport[];
}

