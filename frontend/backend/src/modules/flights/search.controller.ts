import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiStandardResponses } from '../../common/swagger-responses';
import { FlightsService } from './flights.service';

@ApiTags('flights')
@ApiStandardResponses()
@Controller('search')
export class SearchController {
  constructor(private flights: FlightsService) {}
  @Get()
  async search(@Query() q: { origin: string; destination: string; date: string }) {
    return this.flights.search({ origin: q.origin, destination: q.destination, date: q.date });
  }
}
