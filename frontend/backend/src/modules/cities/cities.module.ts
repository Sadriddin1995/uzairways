import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { City } from './city.model';
import { Country } from '../geo/country.model';
import { CitiesController } from './cities.controller';
import { CitiesService } from './cities.service';

@Module({
  imports: [SequelizeModule.forFeature([City, Country])],
  controllers: [CitiesController],
  providers: [CitiesService],
  exports: [SequelizeModule],
})
export class CitiesModule {}
