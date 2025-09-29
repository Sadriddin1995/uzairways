import { BadRequestException, Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { TicketPayment } from './ticket.model';
import { Flight } from '../flights/flight.model';
import { CabinClass } from '../classes/class.model';
import { Booking } from '../bookings/booking.model';
import { BookingPassenger } from '../bookings/booking-passenger.model';
import { BookingSeat } from '../bookings/booking-seat.model';
import { Seat } from '../seats/seat.model';
import { UsersService } from '../users/users.service';
import { v4 as uuidv4 } from 'uuid';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class TicketsService {
  constructor(
    @InjectModel(TicketPayment) private ticketModel: typeof TicketPayment,
    @InjectModel(Booking) private bookingModel: typeof Booking,
    @InjectModel(BookingPassenger) private bookingPassengerModel: typeof BookingPassenger,
    @InjectModel(Flight) private flightModel: typeof Flight,
    @InjectModel(CabinClass) private cabinClassModel: typeof CabinClass,
    private users: UsersService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async create(userId: number, data: { flightId: number; returnFlightId?: number; classId: number; seatId: number; passengers: any[] }) {
    const flight = await this.flightModel.findByPk(data.flightId);
    if (!flight || flight.status !== 'SCHEDULED') throw new BadRequestException('Invalid flight');
    let returnFlight: Flight | null = null;
    if (data.returnFlightId) {
      returnFlight = await this.flightModel.findByPk(data.returnFlightId);
      if (!returnFlight || returnFlight.status !== 'SCHEDULED') throw new BadRequestException('Invalid return flight');
    }
    const cabin = await this.cabinClassModel.findByPk(data.classId);
    if (!cabin) throw new BadRequestException('Invalid cabin class');

    const mult = cabin.priceMultiplier ?? 1;
    // per-flight class pricing override
    const cfg = Array.isArray((flight as any).classPricing) ? (flight as any).classPricing as any[] : [];
    const override = cfg.find((c:any) => c.classId === cabin.id);
    if (!override?.price) throw new BadRequestException("Price not configured for selected class");
    const perSeat = Number(override.price);
    const oneWay = perSeat;
    const rtn = 0;
    const price = (oneWay + rtn) * data.passengers.length;

    const user = await this.users.findById(userId);
    if (!user) throw new BadRequestException('User not found');
    const currentBalance = Number(user.balance || 0);
    if (currentBalance < price) throw new BadRequestException('Insufficient balance');
    try {
      const sequelize = this.ticketModel.sequelize;
      if (!sequelize) throw new Error('Sequelize instance not available');
      return await sequelize.transaction(async (t) => {
        const booking = await this.bookingModel.create({
          userId,
          flightId: flight.id,
          returnFlightId: returnFlight?.id || null,
          classId: data.classId,
          status: 'CONFIRMED',
          totalPrice: price.toFixed(2),
          pnr: this.makePNR(),
        }, { transaction: t });

        for (const p of data.passengers) {
          await this.bookingPassengerModel.create({ bookingId: booking.id, ...p }, { transaction: t });
        }

        // Seat selection is required and validated
        if (!data.seatId) throw new BadRequestException('Seat is required');
        const seat = await Seat.findByPk(data.seatId);
        if (!seat) throw new BadRequestException('Seat not found');
        if (seat.classId !== cabin.id) throw new BadRequestException('Seat does not match selected class');
        if (seat.planeId !== flight.planeId) throw new BadRequestException('Seat not on this flight plane');
        // Enforce optional seatLimit from classPricing
        if (override?.seatLimit && override.seatLimit > 0) {
          const takenCount = await BookingSeat.count({ where: { flightId: flight.id }, include: [{ model: Seat as any, where: { classId: cabin.id } }] as any, transaction: t });
          if (takenCount >= override.seatLimit) throw new BadRequestException('No seats left for selected class');
        }
        const taken = await BookingSeat.findOne({ where: { flightId: flight.id, seatId: data.seatId }, transaction: t });
        if (taken) throw new BadRequestException('Seat already taken');
        await BookingSeat.create({ bookingId: booking.id, flightId: flight.id, seatId: data.seatId }, { transaction: t });

        user.balance = (currentBalance - price).toFixed(2);
        await user.save({ transaction: t });

        const ticket = await this.ticketModel.create({ userId, bookingId: booking.id, amount: price.toFixed(2), status: 'PAID' }, { transaction: t });

        await this.cache.del(`seats:flight:${flight.id}:all`);
        await this.cache.del(`seats:flight:${flight.id}:${data.classId}`);
        if (returnFlight) await this.cache.del(`seats:flight:${returnFlight.id}:all`);

        return ticket;
      });
    } catch (e: any) {
      throw new BadRequestException(e?.message || 'Failed to create ticket');
    }
  }

  async myTickets(userId: number) {
    return this.ticketModel.findAll({ where: { userId }, include: [{ model: Booking, include: [Flight] }] as any });
  }

  private makePNR(): string {
    return uuidv4().split('-')[0].toUpperCase();
  }
}


