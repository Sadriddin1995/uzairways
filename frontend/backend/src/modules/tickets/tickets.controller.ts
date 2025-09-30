import { Body, Controller, Get, Post, Req, UseGuards, HttpCode } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiStandardResponses } from '../../common/swagger-responses';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('tickets')
@ApiStandardResponses()
@ApiBearerAuth()
@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(private tickets: TicketsService) {}

  @Post()
  @HttpCode(200)
  async create(@Req() req: any, @Body() dto: CreateTicketDto) {
    try {
      return await this.tickets.create(req.user.id, dto as any);
    } catch (e: any) {
      const msg = e?.message || 'Ticket creation failed';
      
      console.error('Ticket create error:', e);
      throw new (require('@nestjs/common').BadRequestException)(msg);
    }
  }

  @Get('mine')
  mine(@Req() req: any) {
    return this.tickets.myTickets(req.user.id);
  }
}
