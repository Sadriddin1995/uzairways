import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '../src/modules/users/users.module';
import { AuthModule } from '../src/modules/auth/auth.module';
import { CountriesModule } from '../src/modules/countries/countries.module';
import { UsersService } from '../src/modules/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../src/modules/users/user.model';
import { Country } from '../src/modules/geo/country.model';
import { City } from '../src/modules/cities/city.model';
import { Airport } from '../src/modules/geo/airport.model';
import { Company } from '../src/modules/companies/company.model';
import { Plane } from '../src/modules/planes/plane.model';
import { Seat } from '../src/modules/seats/seat.model';
import { CabinClass } from '../src/modules/classes/class.model';
import { Flight } from '../src/modules/flights/flight.model';
import { Booking } from '../src/modules/bookings/booking.model';
import { BookingSeat } from '../src/modules/bookings/booking-seat.model';
import { BookingPassenger } from '../src/modules/bookings/booking-passenger.model';
import { Review } from '../src/modules/reviews/review.model';
import { LoyaltyTransaction } from '../src/modules/loyalty/loyalty-transaction.model';
import { News } from '../src/modules/news/news.model';
import { TicketPayment } from '../src/modules/tickets/ticket.model';

describe('Auth + Countries E2E (sqlite in-memory)', () => {
  let app: INestApplication;
  let usersService: UsersService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        SequelizeModule.forRoot({
          dialect: 'sqlite',
          storage: ':memory:',
          autoLoadModels: true,
          synchronize: true,
          logging: false,
          models: [
            User,
            Country,
            City,
            Airport,
            Company,
            Plane,
            Seat,
            CabinClass,
            Flight,
            Booking,
            BookingSeat,
            BookingPassenger,
            Review,
            LoyaltyTransaction,
            News,
            TicketPayment,
          ],
        }),
        UsersModule,
        AuthModule,
        CountriesModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    usersService = app.get(UsersService);
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('registers user', async () => {
    const email = 'user@test.uz';
    const password = 'user123';
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email, password, fullName: 'User Test' })
      .expect(201);
  });

  it('creates and fetches country (admin token)', async () => {
    const email = 'admin@test.uz';
    const password = 'admin123';
    let admin = await usersService.findByEmail(email);
    if (!admin) {
      admin = await usersService.create(email, password, 'Admin Test');
    }
    await usersService.setRole(admin!.id, 'SUPER_ADMIN');
    const jwt = app.get(JwtService);
    const token = jwt.sign({ sub: admin!.id, email: admin!.email, role: 'SUPER_ADMIN', fullName: admin!.fullName });

    const created = await request(app.getHttpServer())
      .post('/api/countries')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Testland', isoCode: 'TL' })
      .expect(201);
    expect(created.body.id).toBeDefined();
    expect(created.body.name).toBe('Testland');
    expect(created.body.isoCode).toBe('TL');
  });
});
