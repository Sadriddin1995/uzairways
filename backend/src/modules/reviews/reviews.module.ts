import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Review } from './review.model';
import { Flight } from '../flights/flight.model';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';

@Module({
  imports: [SequelizeModule.forFeature([Review, Flight])],
  providers: [ReviewsService],
  controllers: [ReviewsController],
  exports: [SequelizeModule],
})
export class ReviewsModule {}
