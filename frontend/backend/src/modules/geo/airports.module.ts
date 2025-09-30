import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Country } from './country.model';
import { City } from '../cities/city.model';
import { Airport } from './airport.model';
import { AirportsController } from './airports.controller';
import { AirportsService } from './airports.service';

@Module({
  imports: [SequelizeModule.forFeature([Country, City, Airport])],
  controllers: [AirportsController],
  providers: [AirportsService],
  exports: [SequelizeModule],
})
export class AirportsModule {}
