import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CabinClass } from './class.model';
import { ClassesService } from './classes.service';
import { ClassesController } from './classes.controller';

@Module({
  imports: [SequelizeModule.forFeature([CabinClass])],
  providers: [ClassesService],
  controllers: [ClassesController],
  exports: [SequelizeModule],
})
export class ClassesModule {}
