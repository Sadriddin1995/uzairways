import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Booking } from './booking.model';
import { BookingSeat } from './booking-seat.model';
import { BookingPassenger } from './booking-passenger.model';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { Flight } from '../flights/flight.model';
import { Seat } from '../seats/seat.model';
import { CabinClass } from '../classes/class.model';

@Module({
  imports: [SequelizeModule.forFeature([Booking, BookingSeat, BookingPassenger, Flight, Seat, CabinClass])],
  providers: [BookingsService],
  controllers: [BookingsController],
  exports: [SequelizeModule, BookingsService],
})
export class BookingsModule {}
