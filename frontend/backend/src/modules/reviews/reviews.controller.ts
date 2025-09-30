import { Body, Controller, Delete, Get, Param, Post, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiStandardResponses } from '../../common/swagger-responses';

@ApiTags('reviews')
@ApiStandardResponses()
@Controller('reviews')
export class ReviewsController {
  constructor(private reviews: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  create(@Req() req: any, @Body() body: { rating: number; comment: string; flightId: number }) {
    return this.reviews.create(req.user.id, body);
  }

  @Get('flight/:id')
  byFlight(@Param('id', ParseIntPipe) id: number) { return this.reviews.listForFlight(id); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get()
  all() { return this.reviews.listAll(); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) { return this.reviews.remove(id); }
}
