import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Plane } from './plane.model';
import { Company } from '../companies/company.model';

@Injectable()
export class PlanesService {
  constructor(@InjectModel(Plane) private planeModel: typeof Plane, @InjectModel(Company) private companyModel: typeof Company) {}

  async create(data: Partial<Plane>) {
    try {
      if (!data.companyId) throw new BadRequestException('companyId is required');
      const company = await this.companyModel.findByPk(data.companyId);
      if (!company) throw new NotFoundException('Company not found');
      if (!data.code || !data.model) throw new BadRequestException('code and model are required');
      const exists = await this.planeModel.findOne({ where: { code: data.code } });
      if (exists) throw new BadRequestException('Plane code already exists');
      return await this.planeModel.create(data as any);
    } catch (e: any) {
      throw new BadRequestException(e?.message || 'Failed to create plane');
    }
  }
  findAll() { return this.planeModel.findAll({ include: ['company'], order: [['model', 'ASC']] }); }
  findOne(id: number) { return this.planeModel.findByPk(id, { include: ['company'] }); }

  async update(id: number, data: Partial<Plane>) {
    const p = await this.planeModel.findByPk(id);
    if (!p) throw new NotFoundException('Plane not found');
    if (data.companyId && data.companyId !== p.companyId) {
      const company = await this.companyModel.findByPk(data.companyId);
      if (!company) throw new NotFoundException('Company not found');
    }
    if (data.code && data.code !== p.code) {
      const exists = await this.planeModel.findOne({ where: { code: data.code } });
      if (exists) throw new BadRequestException('Plane code already exists');
    }
    try {
      return await p.update(data);
    } catch (e: any) {
      throw new BadRequestException(e?.message || 'Failed to update plane');
    }
  }

  async remove(id: number) {
    const p = await this.planeModel.findByPk(id);
    if (!p) throw new NotFoundException('Plane not found');
    await p.destroy();
    return { success: true };
  }
}
