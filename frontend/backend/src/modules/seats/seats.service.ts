import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Seat } from './seat.model';
import { Plane } from '../planes/plane.model';
import { CabinClass } from '../classes/class.model';

@Injectable()
export class SeatsService {
  constructor(
    @InjectModel(Seat) private seatModel: typeof Seat,
    @InjectModel(Plane) private planeModel: typeof Plane,
    @InjectModel(CabinClass) private classModel: typeof CabinClass,
  ) {}

  findAll(planeId?: number) {
    const where: any = {};
    if (planeId) where.planeId = planeId;
    return this.seatModel.findAll({ where, order: [['row', 'ASC'], ['col', 'ASC']] });
  }

  findOne(id: number) { return this.seatModel.findByPk(id); }

  async create(data: Partial<Seat>) {
    try {
      if (!data.planeId || !data.classId || !data.seatNumber) throw new BadRequestException('planeId, classId, seatNumber are required');
      const [plane, cls] = await Promise.all([
        this.planeModel.findByPk(data.planeId),
        this.classModel.findByPk(data.classId),
      ]);
      if (!plane) throw new NotFoundException('Plane not found');
      if (!cls) throw new NotFoundException('Class not found');
      const exists = await this.seatModel.findOne({ where: { planeId: data.planeId, seatNumber: data.seatNumber } });
      if (exists) throw new BadRequestException('Seat number already exists on this plane');
      return await this.seatModel.create(data as any);
    } catch (e: any) {
      throw new BadRequestException(e?.message || 'Failed to create seat');
    }
  }

  async update(id: number, data: Partial<Seat>) {
    const s = await this.findOne(id);
    if (!s) throw new NotFoundException('Seat not found');
    if (data.planeId && data.planeId !== s.planeId) {
      const plane = await this.planeModel.findByPk(data.planeId);
      if (!plane) throw new NotFoundException('Plane not found');
    }
    if (data.classId && data.classId !== s.classId) {
      const cls = await this.classModel.findByPk(data.classId);
      if (!cls) throw new NotFoundException('Class not found');
    }
    if (data.seatNumber && (data.seatNumber !== s.seatNumber || (data.planeId && data.planeId !== s.planeId))) {
      const exists = await this.seatModel.findOne({ where: { planeId: data.planeId ?? s.planeId, seatNumber: data.seatNumber } });
      if (exists) throw new BadRequestException('Seat number already exists on this plane');
    }
    try {
      return await s.update(data);
    } catch (e: any) {
      throw new BadRequestException(e?.message || 'Failed to update seat');
    }
  }

  async remove(id: number) {
    const s = await this.findOne(id);
    if (!s) throw new NotFoundException('Seat not found');
    await s.destroy();
    return { success: true };
  }
}
