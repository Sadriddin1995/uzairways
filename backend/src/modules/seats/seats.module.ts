import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Seat } from './seat.model';
import { SeatsService } from './seats.service';
import { SeatsController } from './seats.controller';
import { Plane } from '../planes/plane.model';
import { CabinClass } from '../classes/class.model';

@Module({
  imports: [SequelizeModule.forFeature([Seat, Plane, CabinClass])],
  providers: [SeatsService],
  controllers: [SeatsController],
  exports: [SequelizeModule, SeatsService],
})
export class SeatsModule {}
