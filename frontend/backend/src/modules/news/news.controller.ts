import { Body, Controller, Get, Param, Post, UseGuards, ParseIntPipe } from '@nestjs/common';
import { NewsService } from './news.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiStandardResponses } from '../../common/swagger-responses';
import { CreateNewsDto, UpdateNewsDto } from './dto';

@ApiTags('news')
@ApiStandardResponses()
@Controller('news')
export class NewsController {
  constructor(private news: NewsService) {}

  @Get()
  published() { return this.news.listPublished(); }

  @Get(':slug')
  bySlug(@Param('slug') slug: string) { return this.news.bySlug(slug); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post()
  create(@Body() body: CreateNewsDto) { return this.news.create(body); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateNewsDto) { return this.news.update(id, body); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post(':id/delete')
  remove(@Param('id', ParseIntPipe) id: number) { return this.news.remove(id); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get('admin/all')
  listAll() { return this.news.listAll(); }
}
