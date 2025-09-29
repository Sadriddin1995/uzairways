import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';
import { FlightsModule } from '../flights/flights.module';
import { NewsModule } from '../news/news.module';

@Module({
  imports: [UsersModule, FlightsModule, NewsModule],
  controllers: [AdminController],
})
export class AdminModule {}
