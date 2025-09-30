import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, ParseIntPipe } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiStandardResponses } from '../../common/swagger-responses';
import { CreateCityDto, UpdateCityDto } from './dto';

@ApiTags('cities')
@ApiStandardResponses()
@Controller('cities')
export class CitiesController {
  constructor(private cities: CitiesService) {}

  @Get()
  list() { return this.cities.list(); }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) { return this.cities.findOne(id); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post()
  create(@Body() body: CreateCityDto) { return this.cities.create(body); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateCityDto) { return this.cities.update(id, body); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) { return this.cities.remove(id); }
}
