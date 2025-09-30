import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Plane } from './plane.model';
import { Company } from '../companies/company.model';
import { PlanesService } from './planes.service';
import { PlanesController } from './planes.controller';

@Module({
  imports: [SequelizeModule.forFeature([Plane, Company])],
  providers: [PlanesService],
  controllers: [PlanesController],
  exports: [SequelizeModule],
})
export class PlanesModule {}
