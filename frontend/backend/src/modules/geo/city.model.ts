import { Table, Column, Model, DataType, Default, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Country } from './country.model';
import { Airport } from './airport.model';

@Table({ tableName: 'cities' })
export class City extends Model<City, Partial<City>> {
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID, primaryKey: true })
  id!: string;

  @Column(DataType.STRING)
  name!: string;

  @ForeignKey(() => Country)
  @Column(DataType.UUID)
  countryId!: string;

  @BelongsTo(() => Country) country!: Country;
  @HasMany(() => Airport) airports!: Airport[];
}
