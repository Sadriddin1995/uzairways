import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { FlightsService } from './flights.service';
import { CreateFlightDto, SearchFlightsDto } from './dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiStandardResponses } from '../../common/swagger-responses';
import { UpdateFlightDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';

@ApiTags('flights')
@ApiStandardResponses()
@Controller('flights')
export class FlightsController {
  constructor(private flights: FlightsService) {}

  @Get('search')
  async search(@Query() q: SearchFlightsDto) {
    const { origin, destination, date, cabin, adults } = q;
    return this.flights.search({ origin, destination, date, cabin, adults });
  }

  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number) {
    return this.flights.findById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post()
  create(@Body() body: CreateFlightDto) { return this.flights.create(body); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateFlightDto) { return this.flights.update(id, body); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post(':id/cancel')
  cancel(@Param('id', ParseIntPipe) id: number) { return this.flights.cancel(id); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get()
  list() { return this.flights.list(); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) { return this.flights.remove(id); }
}
