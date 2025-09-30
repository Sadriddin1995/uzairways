import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'news' })
export class News extends Model<News, Partial<News>> {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  id!: number;

  @Column(DataType.STRING)
  title!: string;

  @Column({ type: DataType.STRING, unique: true })
  slug!: string;

  @Column(DataType.TEXT)
  content!: string;

  @Column(DataType.DATE)
  publishedAt!: Date | null;

  @Column({ type: DataType.STRING, defaultValue: 'DRAFT' })
  status!: 'DRAFT' | 'PUBLISHED';
}
