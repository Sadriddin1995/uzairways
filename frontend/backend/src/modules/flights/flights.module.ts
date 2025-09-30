import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Flight } from './flight.model';
import { FlightsService } from './flights.service';
import { FlightsController } from './flights.controller';
import { SearchController } from './search.controller';
import { Airport } from '../geo/airport.model';
import { Company } from '../companies/company.model';
import { Plane } from '../planes/plane.model';
import { CabinClass } from '../classes/class.model';

@Module({
  imports: [SequelizeModule.forFeature([Flight, Airport, Company, Plane, CabinClass])],
  providers: [FlightsService],
  controllers: [FlightsController, SearchController],
  exports: [SequelizeModule, FlightsService],
})
export class FlightsModule {}
