import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { News } from './news.model';
import { Op } from 'sequelize';

@Injectable()
export class NewsService {
  constructor(@InjectModel(News) private newsModel: typeof News) {}

  listPublished() {
    return this.newsModel.findAll({ where: { status: 'PUBLISHED' }, order: [['publishedAt', 'DESC']], limit: 50 });
  }

  bySlug(slug: string) {
    return this.newsModel.findOne({ where: { slug, status: { [Op.in]: ['DRAFT', 'PUBLISHED'] } } });
  }

  async create(data: Partial<News>) {
    try {
      if (!data.slug) throw new BadRequestException('slug is required');
      const exists = await this.newsModel.findOne({ where: { slug: data.slug } });
      if (exists) throw new BadRequestException('slug already exists');
      return await this.newsModel.create(data as any);
    } catch (e: any) {
      throw new BadRequestException(e?.message || 'Failed to create news');
    }
  }
  async update(id: number, data: Partial<News>) {
    const n = await this.newsModel.findByPk(id);
    if (!n) throw new NotFoundException('News not found');
    if (data.slug && data.slug !== n.slug) {
      const exists = await this.newsModel.findOne({ where: { slug: data.slug } });
      if (exists) throw new BadRequestException('slug already exists');
    }
    try {
      return await n.update(data);
    } catch (e: any) {
      throw new BadRequestException(e?.message || 'Failed to update news');
    }
  }
  async remove(id: number) {
    const n = await this.newsModel.findByPk(id);
    if (!n) throw new NotFoundException('News not found');
    try {
      await n.destroy();
      return { success: true };
    } catch (e: any) {
      throw new BadRequestException(e?.message || 'Failed to delete news');
    }
  }
  listAll() { return this.newsModel.findAll({ order: [['createdAt', 'DESC']] }); }
}
