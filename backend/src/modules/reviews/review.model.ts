import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from '../users/user.model';
import { Flight } from '../flights/flight.model';

@Table({ tableName: 'reviews' })
export class Review extends Model<Review, Partial<Review>> {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  id!: number;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  userId!: number;

  @BelongsTo(() => User) user!: User;

  @ForeignKey(() => Flight)
  @Column(DataType.INTEGER)
  flightId!: number;

  @BelongsTo(() => Flight) flight!: Flight;

  @Column({ type: DataType.INTEGER, validate: { min: 1, max: 5 } })
  rating!: number;

  @Column(DataType.TEXT)
  comment!: string;
}
