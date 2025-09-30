import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, ParseIntPipe } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiStandardResponses } from '../../common/swagger-responses';

@ApiTags('companies')
@ApiStandardResponses()
@Controller('companies')
export class CompaniesController {
  constructor(private companies: CompaniesService) {}

  @Get()
  list() { return this.companies.findAll(); }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) { return this.companies.findOne(id); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post()
  create(@Body() body: CreateCompanyDto) { return this.companies.create(body); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateCompanyDto) { return this.companies.update(id, body); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) { return this.companies.remove(id); }
}
