import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Airport } from './airport.model';
import { Op } from 'sequelize';
import { AirportsService } from './airports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiStandardResponses } from '../../common/swagger-responses';
import { CreateAirportDto, UpdateAirportDto } from './dto';

@ApiTags('airports')
@ApiStandardResponses()
@Controller('airports')
export class AirportsController {
  constructor(@InjectModel(Airport) private airportModel: typeof Airport, private airports: AirportsService) {}

  @Get()
  async list(@Query('q') q?: string) {
    return this.airports.list(q);
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) { return this.airports.findOne(id); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post()
  create(@Body() body: CreateAirportDto) { return this.airports.create(body); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateAirportDto) { return this.airports.update(id, body); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) { return this.airports.remove(id); }
}
