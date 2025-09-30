import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { FlightsModule } from './modules/flights/flights.module';
import { AirportsModule } from './modules/geo/airports.module';
import { CitiesModule } from './modules/cities/cities.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { PlanesModule } from './modules/planes/planes.module';
import { SeatsModule } from './modules/seats/seats.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';
import { NewsModule } from './modules/news/news.module';
import { AdminModule } from './modules/admin/admin.module';
import { ClassesModule } from './modules/classes/classes.module';
import { CountriesModule } from './modules/countries/countries.module';
import { AppInitService } from './app.init';
import { TicketsModule } from './modules/tickets/tickets.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        if (process.env.REDIS_HOST) {
          return {
            store: await redisStore({
              socket: { host: process.env.REDIS_HOST, port: Number(process.env.REDIS_PORT || 6379) },
              ttl: 60,
            } as any),
            ttl: 60,
            max: 1000,
          };
        }
        return { ttl: 60, max: 1000 };
      },
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || '0880',
      database: process.env.DB_NAME || 'airways',
      autoLoadModels: true,
      synchronize: process.env.DB_SYNC === 'true',
      sync: {
        alter: process.env.DB_ALTER === 'true',
        force: process.env.DB_FORCE === 'true',
      },
      logging: false,
    }),
    UsersModule,
    AuthModule,
    FlightsModule,
    AirportsModule,
    CitiesModule,
    CountriesModule,
    CompaniesModule,
    PlanesModule,
    SeatsModule,
    BookingsModule,
    ReviewsModule,
    LoyaltyModule,
    NewsModule,
    AdminModule,
    ClassesModule,
    TicketsModule,
  ],
  providers: [AppInitService],
})
export class AppModule {}
