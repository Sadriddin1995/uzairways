import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiStandardResponses } from '../../common/swagger-responses';
import { ClassesService } from './classes.service';
import { CreateClassDto, UpdateClassDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';

@ApiTags('classes')
@ApiStandardResponses()
@Controller('classes')
export class ClassesController {
  constructor(private classes: ClassesService) {}

  @Get()
  list() { return this.classes.findAll(); }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) { return this.classes.findOne(id); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post()
  create(@Body() body: CreateClassDto) { return this.classes.create(body); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateClassDto) { return this.classes.update(id, body); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) { return this.classes.remove(id); }
}
