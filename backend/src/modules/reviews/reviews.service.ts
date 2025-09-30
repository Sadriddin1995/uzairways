import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Review } from './review.model';
import { Flight } from '../flights/flight.model';

@Injectable()
export class ReviewsService {
  constructor(@InjectModel(Review) private reviewModel: typeof Review, @InjectModel(Flight) private flightModel: typeof Flight) {}

  async create(userId: number, data: { rating: number; comment: string; flightId: number }) {
    try {
      const f = await this.flightModel.findByPk(data.flightId);
      if (!f) throw new NotFoundException('Flight not found');
      const rating = Number(data.rating);
      if (!(rating >= 1 && rating <= 5)) throw new BadRequestException('rating must be 1..5');
      return await this.reviewModel.create({ userId, rating, comment: data.comment, flightId: data.flightId });
    } catch (e: any) {
      throw new BadRequestException(e?.message || 'Failed to create review');
    }
  }

  listForFlight(flightId: number) {
    return this.reviewModel.findAll({ where: { flightId }, include: ['user'] });
  }

  listAll() { return this.reviewModel.findAll({ include: ['user', 'flight'] }); }

  async remove(id: number) {
    const r = await this.reviewModel.findByPk(id);
    if (!r) throw new NotFoundException('Review not found');
    try {
      await r.destroy();
      return { success: true };
    } catch (e: any) {
      throw new BadRequestException(e?.message || 'Failed to delete review');
    }
  }
}
