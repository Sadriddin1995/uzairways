import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Booking } from './booking.model';
import { BookingSeat } from './booking-seat.model';
import { BookingPassenger } from './booking-passenger.model';
import { Flight } from '../flights/flight.model';
import { Seat } from '../seats/seat.model';
import { CabinClass } from '../classes/class.model';
import { v4 as uuidv4 } from 'uuid';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking) private bookingModel: typeof Booking,
    @InjectModel(BookingSeat) private bookingSeatModel: typeof BookingSeat,
    @InjectModel(BookingPassenger) private bookingPassengerModel: typeof BookingPassenger,
    @InjectModel(Flight) private flightModel: typeof Flight,
    @InjectModel(Seat) private seatModel: typeof Seat,
    @InjectModel(CabinClass) private cabinClassModel: typeof CabinClass,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async create(userId: number, data: { flightId: number; returnFlightId?: number; classId: number; passengers: any[] }) {
    try {
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
      const oneWay = Number(flight.basePrice) * mult;
      const rtn = returnFlight ? Number(returnFlight.basePrice) * mult : 0;
      const price = (oneWay + rtn) * data.passengers.length;
      const booking = await this.bookingModel.create({
        userId, flightId: flight.id, returnFlightId: returnFlight?.id || null,
        classId: data.classId, status: 'CONFIRMED', totalPrice: price.toFixed(2), pnr: this.makePNR(),
      });
      for (const p of data.passengers) {
        await this.bookingPassengerModel.create({ bookingId: booking.id, ...p });
      }
      await this.cache.del(`seats:flight:${flight.id}:all`);
      if (returnFlight) await this.cache.del(`seats:flight:${returnFlight.id}:all`);
      return booking;
    } catch (e: any) {
      throw new BadRequestException(e?.message || 'Failed to create booking');
    }
  }

  private makePNR(): string {
    return uuidv4().split('-')[0].toUpperCase();
  }

  async seatsForFlight(flightId: number, classId?: number) {
    const cacheKey = `seats:flight:${flightId}:${classId || 'all'}`;
    const cached = await this.cache.get<any[]>(cacheKey);
    if (cached) return cached;

    const flight = await this.flightModel.findByPk(flightId, { include: ['plane'] });
    if (!flight) throw new BadRequestException('Flight not found');
    const where: any = { planeId: flight.planeId };
    if (classId) where.classId = classId;
    const seats = await this.seatModel.findAll({ where, order: [['row', 'ASC'], ['col', 'ASC']] });
    const booked = await this.bookingSeatModel.findAll({ where: { flightId } });
    const occupiedMap = new Set(booked.map(b => b.seatId));
    const mapped = seats.map(s => ({ id: s.id, seatNumber: s.seatNumber, row: s.row, col: s.col, classId: s.classId, occupied: occupiedMap.has(s.id) }));
    await this.cache.set(cacheKey, mapped, 60_000);
    return mapped;
  }

  async assignSeat(bookingId: number, flightId: number, seatId: number) {
    const existing = await this.bookingSeatModel.findOne({ where: { flightId, seatId } });
    if (existing) throw new BadRequestException('Seat already taken');
    const seat = await this.seatModel.findByPk(seatId);
    if (!seat) throw new BadRequestException('Seat not found');
    const r = await this.bookingSeatModel.create({ bookingId, flightId, seatId });
    await this.cache.del(`seats:flight:${flightId}:all`);
    return r;
  }

  async changeSeat(bookingId: number, flightId: number, newSeatId: number) {
    const bs = await this.bookingSeatModel.findOne({ where: { bookingId, flightId } });
    if (!bs) throw new BadRequestException('No seat assigned');
    const exists = await this.bookingSeatModel.findOne({ where: { flightId, seatId: newSeatId } });
    if (exists) throw new BadRequestException('Seat already taken');
    bs.seatId = newSeatId;
    await bs.save();
    await this.cache.del(`seats:flight:${flightId}:all`);
    return bs;
  }

  async cancel(bookingId: number) {
    const b = await this.bookingModel.findByPk(bookingId);
    if (!b) throw new BadRequestException('Booking not found');
    b.status = 'CANCELLED';
    await b.save();
    await this.cache.del(`seats:flight:${b.flightId}:all`);
    return b;
  }

  async myBookings(userId: number) {
    return this.bookingModel.findAll({ where: { userId }, include: ['flight', 'returnFlight', 'passengers', 'seats'] });
  }
}
