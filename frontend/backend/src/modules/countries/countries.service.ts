import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Country } from '../geo/country.model';

@Injectable()
export class CountriesService {
  constructor(@InjectModel(Country) private countryModel: typeof Country) {}

  list() { return this.countryModel.findAll({ order: [['name', 'ASC']], include: ['cities'] }); }
  findOne(id: number) { return this.countryModel.findByPk(id, { include: ['cities'] }); }
  async create(data: Partial<Country>) {
    try {
      if (!data.name || !data.isoCode) throw new BadRequestException('name and isoCode are required');
      const iso = String(data.isoCode).toUpperCase();
      const exists = await this.countryModel.findOne({ where: { isoCode: iso } });
      if (exists) throw new BadRequestException('Country ISO already exists');
      const nameExists = await this.countryModel.findOne({ where: { name: data.name } });
      if (nameExists) throw new BadRequestException('Country name already exists');
      return await this.countryModel.create({ ...data, isoCode: iso } as any);
    } catch (e: any) {
      throw new BadRequestException(e?.message || 'Failed to create country');
    }
  }

  async update(id: number, data: Partial<Country>) {
    const c = await this.findOne(id);
    if (!c) throw new NotFoundException('Country not found');
    if (data.isoCode && data.isoCode.toUpperCase() !== c.isoCode) {
      const exists = await this.countryModel.findOne({ where: { isoCode: data.isoCode.toUpperCase() } });
      if (exists) throw new BadRequestException('Country ISO already exists');
      data.isoCode = data.isoCode.toUpperCase();
    }
    if (data.name && data.name !== c.name) {
      const nameExists = await this.countryModel.findOne({ where: { name: data.name } });
      if (nameExists) throw new BadRequestException('Country name already exists');
    }
    try {
      return await c.update(data);
    } catch (e: any) {
      throw new BadRequestException(e?.message || 'Failed to update country');
    }
  }

  async remove(id: number) {
    const c = await this.findOne(id);
    if (!c) throw new NotFoundException('Country not found');
    await c.destroy();
    return { success: true };
  }
}
