import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { News } from './news.model';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';

@Module({
  imports: [SequelizeModule.forFeature([News])],
  providers: [NewsService],
  controllers: [NewsController],
  exports: [SequelizeModule,NewsService],
})
export class NewsModule {}
