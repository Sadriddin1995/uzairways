import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Company } from '../companies/company.model';

@Table({ tableName: 'planes' })
export class Plane extends Model<Plane, Partial<Plane>> {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  id!: number;

  @Column(DataType.STRING)
  model!: string;

  @Column(DataType.STRING)
  code!: string;

  @ForeignKey(() => Company)
  @Column({ type: DataType.INTEGER })
  companyId!: number;

  @BelongsTo(() => Company)
  company!: Company;
}
