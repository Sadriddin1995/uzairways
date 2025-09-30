import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, ParseIntPipe } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiStandardResponses } from '../../common/swagger-responses';
import { CreateCountryDto, UpdateCountryDto } from './dto';

@ApiTags('countries')
@ApiStandardResponses()
@Controller('countries')
export class CountriesController {
  constructor(private countries: CountriesService) {}

  @Get()
  list() { return this.countries.list(); }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) { return this.countries.findOne(id); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post()
  create(@Body() body: CreateCountryDto) { return this.countries.create(body); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateCountryDto) { return this.countries.update(id, body); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) { return this.countries.remove(id); }
}
