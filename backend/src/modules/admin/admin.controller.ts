import { Body, Controller, Get, Param, Post, UseGuards, ParseIntPipe, Delete } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { FlightsService } from '../flights/flights.service';
import { NewsService } from '../news/news.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { CreateFlightDto } from '../flights/dto';

class CreateAdminDto {
  @ApiProperty({ example: 'admin2@site.uz' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'admin123' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: 'Admin Two' })
  @IsString()
  @IsNotEmpty()
  fullName!: string;
}

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminController {
  constructor(private users: UsersService, private flights: FlightsService, private news: NewsService) {}

  @Get('admins')
  admins() { return this.users.findAdmins(); }

  @Get('admins/:id')
  adminById(@Param('id', ParseIntPipe) id: number) { return this.users.findAdminById(id); }

  @Get('flights')
  listFlights() { return this.flights.list(); }

  @Post('flights')
  createFlight(@Body() body: CreateFlightDto) { return this.flights.create(body); }

  @Post('flights/:id/cancel')
  cancelFlight(@Param('id', ParseIntPipe) id: number) { return this.flights.cancel(id); }

  @Get('news')
  newsAll() { return this.news.listAll(); }

  
}
