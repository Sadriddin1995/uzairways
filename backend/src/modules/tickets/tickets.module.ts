import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TicketPayment } from './ticket.model';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { Flight } from '../flights/flight.model';
import { CabinClass } from '../classes/class.model';
import { Booking } from '../bookings/booking.model';
import { BookingPassenger } from '../bookings/booking-passenger.model';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    SequelizeModule.forFeature([TicketPayment, Flight, CabinClass, Booking, BookingPassenger]),
    UsersModule,
  ],
  providers: [TicketsService],
  controllers: [TicketsController],
  exports: [SequelizeModule, TicketsService],
})
export class TicketsModule {}
