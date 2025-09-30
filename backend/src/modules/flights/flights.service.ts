import { BadRequestException, Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Flight } from './flight.model';
import { Airport } from '../geo/airport.model';
import { Company } from '../companies/company.model';
import { Plane } from '../planes/plane.model';
import { Seat } from '../seats/seat.model';
import { CabinClass } from '../classes/class.model';
import { Op } from 'sequelize';
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
    @InjectModel(Seat) private seatModel: typeof Seat,
    @InjectModel(CabinClass) private classModel: typeof CabinClass,
  ) {}

  async search(params: { origin: string; destination: string; date: string; cabin?: string; adults?: number }) {
    const originRaw = String(params.origin || '').trim();
    const destRaw = String(params.destination || '').trim();
    const originIata = originRaw.toUpperCase();
    const destIata = destRaw.toUpperCase();
    const dateNorm = this.normalizeDate(String(params.date || ''));
    const adults = params.adults && params.adults > 0 ? params.adults : 1;
    const cabinCode = params.cabin ? String(params.cabin).toUpperCase() : undefined;
    const cacheKey = `flights:search:${originIata}:${destIata}:${dateNorm}:${cabinCode || ''}:${adults}`;
    const cached = await this.cache.get<any[]>(cacheKey);
    if (cached) return cached;

    // Build dynamic WHERE based on provided filters. If none provided, return all scheduled flights.
    const where: any = { status: 'SCHEDULED' };

    if (originRaw) {
      const origin = await this.airportModel.findOne({ where: { [Op.or]: [
        { iata: { [Op.iLike]: originIata } },
        { name: { [Op.iLike]: `%${originRaw}%` } },
      ] } });
      if (!origin) return [];
      where.originAirportId = origin.id;
    }

    if (destRaw) {
      const destination = await this.airportModel.findOne({ where: { [Op.or]: [
        { iata: { [Op.iLike]: destIata } },
        { name: { [Op.iLike]: `%${destRaw}%` } },
      ] } });
      if (!destination) return [];
      where.destinationAirportId = destination.id;
    }

    if (dateNorm) {
      const range = this.makeUtcDayRange(dateNorm);
      if (range) where.departureTime = { [Op.between]: [range.start, range.end] };
    }

    const result = await this.flightModel.findAll({
      where,
      include: ['origin', 'destination', 'company', 'plane'],
      order: [['departureTime', 'ASC']],
    });
    
    let mapped: any = result;
    if (cabinCode) {
      const cabin = await this.classModel.findOne({ where: { code: { [Op.iLike]: cabinCode } } });
      const defaultMultipliers: Record<string, number> = { ECO: 1.0, PRE: 1.5, PREMIUM: 1.5, VIP: 2.0, BUS: 1.6, BUSINESS: 1.6 };
      mapped = result.map(f => {
        const baseNum = Number(f.basePrice);
        const base = Number.isFinite(baseNum) ? baseNum : 0;
        let perTicket: number;
        if (cabin) {
          const cfg = Array.isArray((f as any).classPricing) ? (f as any).classPricing as any[] : [];
          const ov = cfg.find((x:any) => Number(x.classId) === cabin.id && x.price !== undefined);
          if (ov && isFinite(Number(ov.price))) {
            perTicket = Number(Number(ov.price).toFixed(2));
          } else {
            const mult = Number.isFinite(Number((cabin as any).priceMultiplier)) ? Number((cabin as any).priceMultiplier) : 1.0;
            perTicket = Number((base * mult).toFixed(2));
          }
        } else {
          const mult = defaultMultipliers[cabinCode] ?? 1.0;
          perTicket = Number((base * mult).toFixed(2));
        }
        const total = Number((perTicket * adults).toFixed(2));
        const json = (f as any).toJSON ? (f as any).toJSON() : f;
        return { ...json, computedPrice: perTicket.toFixed(2), computedTotal: total.toFixed(2), cabin: cabinCode, adults };
      });
    }
    // Keep cache fresh to reflect newly created admin flights quickly
    await this.cache.set(cacheKey, mapped, 5_000);
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
      if ((data as any).classPricing) {
        payload.classPricing = await this.normalizeAndValidateClassPricing(
          data.planeId!,
          (data as any).classPricing,
        );
        if (!Array.isArray(payload.classPricing) || payload.classPricing.length === 0) {
          throw new BadRequestException('At least one class with a valid price is required');
        }
      }
      const created = await this.flightModel.create(payload);
      // Bust caches so new flights appear immediately in search
      try { await (this.cache as any).reset?.(); } catch {}
      return created;
    } catch (e: any) {
      throw new BadRequestException(e?.message || 'Failed to create flight');
    }
  }

  async cancel(id: number) {
    const f = await this.findById(id);
    if (!f) throw new Error('Flight not found');
    f.status = 'CANCELLED';
    await f.save();
    try { await (this.cache as any).reset?.(); } catch {}
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
      if ((data as any).classPricing) {
        payload.classPricing = await this.normalizeAndValidateClassPricing(
          f.planeId,
          (data as any).classPricing,
        );
      }
      const updated = await f.update(payload);
      try { await (this.cache as any).reset?.(); } catch {}
      return updated;
    } catch (e: any) {
      throw new BadRequestException(e?.message || 'Failed to update flight');
    }
  }

  async remove(id: number) {
    const f = await this.flightModel.findByPk(id);
    if (!f) throw new NotFoundException('Flight not found');
    try {
      await f.destroy();
      try { await (this.cache as any).reset?.(); } catch {}
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

  private async normalizeAndValidateClassPricing(
    planeId: number,
    classPricing: { classId: number; price?: string; seatLimit?: number }[],
  ) {
    const list = Array.isArray(classPricing) ? classPricing : [];
    if (list.length === 0) return [] as any[];

    const classIds = [...new Set(list.map(x => Number(x.classId)).filter(Boolean))];
    const classes = await this.classModel.findAll({ where: { id: classIds } });
    const classMap = new Map(classes.map(c => [c.id, c] as const));

    // Count seats per class for this plane
    const seatCounts = new Map<number, number>();
    for (const cid of classIds) {
      const cnt = await this.seatModel.count({ where: { planeId, classId: cid } });
      seatCounts.set(cid, cnt);
    }

    const prepared: { classId: number; price: string; seatLimit?: number }[] = [];
    for (const item of list) {
      const classId = Number(item.classId);
      if (!classId || !classMap.has(classId)) {
        throw new BadRequestException(`Invalid classId: ${item.classId}`);
      }
      const priceNum = item.price !== undefined ? Number(item.price) : NaN;
      if (!isFinite(priceNum) || priceNum <= 0) {
        // skip invalid prices entirely; do not include in payload
        continue;
      }
      const maxSeats = seatCounts.get(classId) || 0;
      let limit = item.seatLimit;
      if (limit !== undefined && limit !== null) {
        if (!Number.isInteger(limit) || limit <= 0) {
          throw new BadRequestException(`seatLimit must be a positive integer for classId=${classId}`);
        }
        // Do not hard-fail if limit exceeds current seat count; seats can be configured later.
        // We still enforce class seatLimit at purchase time and physical seat availability.
      } else {
        // default limit to available seats for that class (or 0 if none yet)
        limit = maxSeats;
      }
      prepared.push({ classId, price: priceNum.toFixed(2), seatLimit: limit });
    }
    return prepared;
  }
  private normalizeDate(input: string): string {
    const s = String(input || '').trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    const m = s.match(/^(\d{2})[./-](\d{2})[./-](\d{4})$/);
    if (m) {
      const [, dd, MM, yyyy] = m;
      return `${yyyy}-${MM}-${dd}`;
    }
    return s;
  }

  private makeUtcDayRange(dateStr: string): { start: Date; end: Date } | null {
    const s = String(dateStr || '').trim();
    let y: number, m: number, d: number;
    let mm: RegExpMatchArray | null = null;
    if ((mm = s.match(/^(\d{4})-(\d{2})-(\d{2})$/))) {
      y = Number(mm[1]); m = Number(mm[2]); d = Number(mm[3]);
    } else if ((mm = s.match(/^(\d{2})[./-](\d{2})[./-](\d{4})$/))) {
      d = Number(mm[1]); m = Number(mm[2]); y = Number(mm[3]);
    } else {
      return null;
    }
    if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d) || m < 1 || m > 12 || d < 1 || d > 31) return null;
    const start = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
    const end = new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999));
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
    return { start, end };
  }
}
