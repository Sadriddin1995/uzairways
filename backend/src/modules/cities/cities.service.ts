import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { City } from './city.model';
import { Country } from '../geo/country.model';

@Injectable()
export class CitiesService {
  constructor(@InjectModel(City) private cityModel: typeof City, @InjectModel(Country) private countryModel: typeof Country) {}

  list() { return this.cityModel.findAll({ order: [['name', 'ASC']] }); }
  findOne(id: number) { return this.cityModel.findByPk(id); }
  async create(data: Partial<City>) {
    try {
      if (!data.countryId) throw new BadRequestException('countryId is required');
      const country = await this.countryModel.findByPk(data.countryId);
      if (!country) throw new NotFoundException('Country not found');
      if (!data.name) throw new BadRequestException('name is required');
      const exists = await this.cityModel.findOne({ where: { name: data.name, countryId: data.countryId } });
      if (exists) throw new BadRequestException('City already exists in this country');
      return await this.cityModel.create(data as any);
    } catch (e: any) {
      throw new BadRequestException(e?.message || 'Failed to create city');
    }
  }

  async update(id: number, data: Partial<City>) {
    const c = await this.findOne(id);
    if (!c) throw new NotFoundException('City not found');
    if (data.countryId && data.countryId !== c.countryId) {
      const country = await this.countryModel.findByPk(data.countryId);
      if (!country) throw new NotFoundException('Country not found');
    }
    if (data.name && (data.name !== c.name || (data.countryId && data.countryId !== c.countryId))) {
      const exists = await this.cityModel.findOne({ where: { name: data.name, countryId: data.countryId ?? c.countryId } });
      if (exists && exists.id !== id) throw new BadRequestException('City already exists in this country');
    }
    try {
      return await c.update(data);
    } catch (e: any) {
      throw new BadRequestException(e?.message || 'Failed to update city');
    }
  }

  async remove(id: number) {
    const c = await this.findOne(id);
    if (!c) throw new NotFoundException('City not found');
    await c.destroy();
    return { success: true };
  }
}
