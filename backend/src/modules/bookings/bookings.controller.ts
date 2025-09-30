import { Body, Controller, Get, Param, Post, Req, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateBookingDto, AssignSeatDto } from './dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('bookings')
@ApiBearerAuth()
@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private bookings: BookingsService) {}

  @Post()
  async create(@Req() req: any, @Body() dto: CreateBookingDto) {
    return this.bookings.create(req.user.id, dto);
  }

  @Get('mine')
  async mine(@Req() req: any) { return this.bookings.myBookings(req.user.id); }

  @Get(':flightId/seats')
  async seats(@Param('flightId', ParseIntPipe) flightId: number, @Query('classId') classId?: string) {
    return this.bookings.seatsForFlight(flightId, classId ? Number(classId) : undefined);
  }

  @Post(':id/assign-seat')
  async assign(@Param('id', ParseIntPipe) bookingId: number, @Body() dto: AssignSeatDto) {
    return this.bookings.assignSeat(bookingId, dto.flightId, dto.seatId);
  }

  @Post(':id/change-seat')
  async change(@Param('id', ParseIntPipe) bookingId: number, @Body() dto: AssignSeatDto) {
    return this.bookings.changeSeat(bookingId, dto.flightId, dto.seatId);
  }

  @Post(':id/cancel')
  async cancel(@Param('id', ParseIntPipe) bookingId: number) {
    return this.bookings.cancel(bookingId);
  }
}
