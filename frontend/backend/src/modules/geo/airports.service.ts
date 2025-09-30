import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Airport } from './airport.model';
import { Op } from 'sequelize';
import { City } from '../cities/city.model';

@Injectable()
export class AirportsService {
  constructor(@InjectModel(Airport) private airportModel: typeof Airport, @InjectModel(City) private cityModel: typeof City) {}

  async list(q?: string) {
    if (!q) return this.airportModel.findAll({ limit: 50 });
    const term = `%${q}%`;
    return this.airportModel.findAll({ where: { [Op.or]: [{ iata: { [Op.iLike]: term } }, { name: { [Op.iLike]: term } }] }, limit: 20 });
  }

  findOne(id: number) { return this.airportModel.findByPk(id); }

  async create(data: Partial<Airport>) {
    try {
      if (!data.cityId) throw new BadRequestException('cityId is required');
      const city = await this.cityModel.findByPk(data.cityId);
      if (!city) throw new NotFoundException('City not found');
      if (!data.iata || !data.name) throw new BadRequestException('name and iata are required');
      const iata = String(data.iata).toUpperCase();
      const exists = await this.airportModel.findOne({ where: { iata } });
      if (exists) throw new BadRequestException('IATA already exists');
      return await this.airportModel.create({ ...data, iata } as any);
    } catch (e: any) {
      throw new BadRequestException(e?.message || 'Failed to create airport');
    }
  }

  async update(id: number, data: Partial<Airport>) {
    try {
      const a = await this.findOne(id);
      if (!a) throw new NotFoundException('Airport not found');
      if (data.cityId && data.cityId !== a.cityId) {
        const city = await this.cityModel.findByPk(data.cityId);
        if (!city) throw new NotFoundException('City not found');
      }
      if (data.iata && data.iata.toUpperCase() !== a.iata) {
        const exists = await this.airportModel.findOne({ where: { iata: data.iata.toUpperCase() } });
        if (exists) throw new BadRequestException('IATA already exists');
        data.iata = data.iata.toUpperCase();
      }
      return await a.update(data);
    } catch (e: any) {
      throw new BadRequestException(e?.message || 'Failed to update airport');
    }
  }

  async remove(id: number) {
    const a = await this.findOne(id);
    if (!a) throw new NotFoundException('Airport not found');
    await a.destroy();
    return { success: true };
  }
}
