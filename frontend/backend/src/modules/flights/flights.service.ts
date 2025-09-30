import { BadRequestException, Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Flight } from './flight.model';
import { Airport } from '../geo/airport.model';
import { Company } from '../companies/company.model';
import { Plane } from '../planes/plane.model';
import { Op } from 'sequelize';
import dayjs from 'dayjs';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class FlightsService {
  constructor(
    @InjectModel(Flight) private flightModel: typeof Flight,
    @InjectModel(Airport) private airportModel: typeof Airport,
    @Inject(CACHE_MANAGER) private cache: Cache,
    @InjectModel(Company) private companyModel: typeof Company,
    @InjectModel(Plane) private planeModel: typeof Plane,
  ) {}

  async search(params: { origin: string; destination: string; date: string; cabin?: string; adults?: number }) {
    const cacheKey = `flights:search:${params.origin}:${params.destination}:${params.date}`;
    const cached = await this.cache.get<any[]>(cacheKey);
    if (cached) return cached;

    const origin = await this.airportModel.findOne({ where: { [Op.or]: [
      { iata: { [Op.iLike]: params.origin } },
      { name: { [Op.iLike]: params.origin } },
    ] } });
    const destination = await this.airportModel.findOne({ where: { [Op.or]: [
      { iata: { [Op.iLike]: params.destination } },
      { name: { [Op.iLike]: params.destination } },
    ] } });
    if (!origin || !destination) return [];
    const start = dayjs(params.date).startOf('day').toDate();
    const end = dayjs(params.date).endOf('day').toDate();
    const result = await this.flightModel.findAll({
      where: {
        originAirportId: origin.id,
        destinationAirportId: destination.id,
        departureTime: { [Op.between]: [start, end] },
        status: 'SCHEDULED',
      },
      include: ['origin', 'destination', 'company', 'plane'],
      order: [['departureTime', 'ASC']],
    });
    
    let mapped: any = result;
    if (params.cabin) {
      const code = String(params.cabin).toUpperCase();
      
      const multipliers: Record<string, number> = { ECO: 1.0, PRE: 1.5, PREMIUM: 1.5, VIP: 2.0 };
      const mult = multipliers[code] ?? 1.0;
      const adults = params.adults && params.adults > 0 ? params.adults : 1;
      mapped = result.map(f => {
        const base = Number(f.basePrice);
        const perTicket = +(base * mult).toFixed(2);
        const total = +(perTicket * adults).toFixed(2);
        return { ...f.toJSON(), computedPrice: perTicket.toFixed(2), computedTotal: total.toFixed(2), cabin: code, adults };
      });
    }
    await this.cache.set(cacheKey, mapped, 60_000);
    return mapped;
  }

  findById(id: number) {
    return this.flightModel.findByPk(id, { include: ['origin', 'destination', 'company', 'plane'] });
  }

  async create(data: Partial<Flight>) {
    try {
      await this.ensureFlightRefs(data);
      await this.ensureFlightBusinessRules(data as any);
      const payload: any = { ...data };
      if ((data as any).classPricing) payload.classPricing = (data as any).classPricing;
      return await this.flightModel.create(payload);
    } catch (e: any) {
      throw new BadRequestException(e?.message || 'Failed to create flight');
    }
  }

  async cancel(id: number) {
    const f = await this.findById(id);
    if (!f) throw new Error('Flight not found');
    f.status = 'CANCELLED';
    await f.save();
    return f;
  }

  async list() {
    return this.flightModel.findAll({ include: ['origin', 'destination', 'company', 'plane'], order: [['departureTime', 'ASC']] });
  }

  async update(id: number, data: Partial<Flight>) {
    const f = await this.flightModel.findByPk(id);
    if (!f) throw new NotFoundException('Flight not found');
    await this.ensureFlightRefs({ ...f.toJSON(), ...data } as any, f.id);
    if (data.flightNumber && data.flightNumber !== f.flightNumber) {
      const exists = await this.flightModel.findOne({ where: { flightNumber: data.flightNumber } });
      if (exists) throw new BadRequestException('Flight number already exists');
    }
    await this.ensureFlightBusinessRules({ ...f.toJSON(), ...data } as any);
    try {
      const payload: any = { ...data };
      if ((data as any).classPricing) payload.classPricing = (data as any).classPricing;
      return await f.update(payload);
    } catch (e: any) {
      throw new BadRequestException(e?.message || 'Failed to update flight');
    }
  }

  async remove(id: number) {
    const f = await this.flightModel.findByPk(id);
    if (!f) throw new NotFoundException('Flight not found');
    try {
      await f.destroy();
      return { success: true };
    } catch (e: any) {
      throw new BadRequestException(e?.message || 'Failed to delete flight');
    }
  }

  private async ensureFlightRefs(data: Partial<Flight>, ignoreId?: number) {
    if (!data.companyId || !data.planeId || !data.originAirportId || !data.destinationAirportId) {
      throw new BadRequestException('companyId, planeId, originAirportId, destinationAirportId are required');
    }
    const [comp, plane, orig, dest] = await Promise.all([
      this.companyModel.findByPk(data.companyId),
      this.planeModel.findByPk(data.planeId),
      this.airportModel.findByPk(data.originAirportId),
      this.airportModel.findByPk(data.destinationAirportId),
    ]);
    if (!comp) throw new NotFoundException('Company not found');
    if (!plane) throw new NotFoundException('Plane not found');
    if (!orig) throw new NotFoundException('Origin airport not found');
    if (!dest) throw new NotFoundException('Destination airport not found');
    if (data.originAirportId === data.destinationAirportId) throw new BadRequestException('Origin and destination must differ');
    if (data.flightNumber) {
      const exists = await this.flightModel.findOne({ where: { flightNumber: data.flightNumber } });
      if (exists && exists.id !== ignoreId) throw new BadRequestException('Flight number already exists');
    }
  }

  private async ensureFlightBusinessRules(data: { departureTime?: Date; arrivalTime?: Date }) {
    if (data.departureTime && data.arrivalTime) {
      const dep = new Date(data.departureTime).getTime();
      const arr = new Date(data.arrivalTime).getTime();
      if (!(dep < arr)) throw new BadRequestException('arrivalTime must be after departureTime');
    }
  }
}
