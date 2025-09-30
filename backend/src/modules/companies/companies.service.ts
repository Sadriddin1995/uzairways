import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Company } from './company.model';

@Injectable()
export class CompaniesService {
  constructor(@InjectModel(Company) private companyModel: typeof Company) {}

  async create(data: Partial<Company>) {
    try {
      if (!data.name || !data.code) throw new BadRequestException('name and code are required');
      const exists = await this.companyModel.findOne({ where: { code: data.code } });
      if (exists) throw new BadRequestException('Company code already exists');
      const nameExists = await this.companyModel.findOne({ where: { name: data.name } });
      if (nameExists) throw new BadRequestException('Company name already exists');
      return await this.companyModel.create(data as any);
    } catch (e: any) {
      throw new BadRequestException(e?.message || 'Failed to create company');
    }
  }

  findAll() { return this.companyModel.findAll({ order: [['name', 'ASC']] }); }

  findOne(id: number) { return this.companyModel.findByPk(id); }

  async update(id: number, data: Partial<Company>) {
    const c = await this.findOne(id);
    if (!c) throw new NotFoundException('Company not found');
    if (data.code && data.code !== c.code) {
      const exists = await this.companyModel.findOne({ where: { code: data.code } });
      if (exists) throw new BadRequestException('Company code already exists');
    }
    if (data.name && data.name !== c.name) {
      const nameExists = await this.companyModel.findOne({ where: { name: data.name } });
      if (nameExists) throw new BadRequestException('Company name already exists');
    }
    try {
      return await c.update(data);
    } catch (e: any) {
      throw new BadRequestException(e?.message || 'Failed to update company');
    }
  }

  async remove(id: number) {
    const c = await this.findOne(id);
    if (!c) throw new NotFoundException('Company not found');
    await c.destroy();
    return { success: true };
  }
}
