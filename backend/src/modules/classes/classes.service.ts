import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CabinClass } from './class.model';

@Injectable()
export class ClassesService {
  constructor(@InjectModel(CabinClass) private classModel: typeof CabinClass) {}

  async create(data: Partial<CabinClass>) {
    try {
      if (!data.name || !data.code) throw new BadRequestException('name and code are required');
      const exists = await this.classModel.findOne({ where: { code: data.code } });
      if (exists) throw new BadRequestException('Class code already exists');
      return await this.classModel.create(data as any);
    } catch (e: any) {
      throw new BadRequestException(e?.message || 'Failed to create class');
    }
  }

  findAll() { return this.classModel.findAll({ order: [['name', 'ASC']] }); }

  findOne(id: number) { return this.classModel.findByPk(id); }

  async update(id: number, data: Partial<CabinClass>) {
    const cls = await this.findOne(id);
    if (!cls) throw new NotFoundException('Class not found');
    if (data.code && data.code !== cls.code) {
      const exists = await this.classModel.findOne({ where: { code: data.code } });
      if (exists) throw new BadRequestException('Class code already exists');
    }
    try {
      return await cls.update(data);
    } catch (e: any) {
      throw new BadRequestException(e?.message || 'Failed to update class');
    }
  }

  async remove(id: number) {
    const cls = await this.findOne(id);
    if (!cls) throw new NotFoundException('Class not found');
    await cls.destroy();
    return { success: true };
  }
}
