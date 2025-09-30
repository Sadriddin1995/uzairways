import 'reflect-metadata';
import 'dotenv/config';
import { Sequelize } from 'sequelize-typescript';
import { User } from './modules/users/user.model';
import { Country } from './modules/geo/country.model';
import { City } from './modules/cities/city.model';
import { Airport } from './modules/geo/airport.model';
import { Company } from './modules/companies/company.model';
import { Plane } from './modules/planes/plane.model';
import { Seat } from './modules/seats/seat.model';
import { CabinClass } from './modules/classes/class.model';
import { Flight } from './modules/flights/flight.model';
import { Booking } from './modules/bookings/booking.model';
import { BookingSeat } from './modules/bookings/booking-seat.model';
import { BookingPassenger } from './modules/bookings/booking-passenger.model';
import { Review } from './modules/reviews/review.model';
import { LoyaltyTransaction } from './modules/loyalty/loyalty-transaction.model';
import { News } from './modules/news/news.model';
import * as bcrypt from 'bcrypt';
import dayjs = require('dayjs');

async function run() {
  const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    database: process.env.DB_NAME || 'uzairways',
    logging: false,
    models: [User, Country, City, Airport, Company, Plane, Seat, CabinClass, Flight, Booking, BookingSeat, BookingPassenger, Review, LoyaltyTransaction, News],
  });

  await sequelize.sync({ force: true });

  const [vip, eco, premium] = await Promise.all([
    CabinClass.create({ name: 'VIP', code: 'VIP', priceMultiplier: 2.0 }),
    CabinClass.create({ name: 'ECONOMY', code: 'ECO', priceMultiplier: 1.0 }),
    CabinClass.create({ name: 'PREMIUM', code: 'PRE', priceMultiplier: 1.5 }),
  ]);

  const [uzb] = await Promise.all([Country.create({ name: 'Uzbekistan', isoCode: 'UZ' })]);
  const [tashkent, samarkand, bukhara] = await Promise.all([
    City.create({ name: 'Tashkent', countryId: uzb.id }),
    City.create({ name: 'Samarkand', countryId: uzb.id }),
    City.create({ name: 'Bukhara', countryId: uzb.id }),
  ]);
  const [tas, skd, bhk] = await Promise.all([
    Airport.create({ name: 'Tashkent International', iata: 'TAS', cityId: tashkent.id }),
    Airport.create({ name: 'Samarkand', iata: 'SKD', cityId: samarkand.id }),
    Airport.create({ name: 'Bukhara', iata: 'BHK', cityId: bukhara.id }),
  ]);

  const uz = await Company.create({ name: 'UzAirways', code: 'HY' });
  const plane = await Plane.create({ model: 'A320', code: 'A320-1', companyId: uz.id });

  const letters = ['A','B','C','D','E','F'];
  for (let row = 1; row <= 30; row++) {
    const classId = row <= 4 ? premium.id : eco.id;
    for (const col of letters) {
      const seatNumber = `${row}${col}`;
      await Seat.create({ planeId: plane.id, classId, row, col, seatNumber });
    }
  }

  const flights: Flight[] = [];
  for (let i=0; i<10; i++) {
    const dep = dayjs().add(i+1, 'day').hour(9).minute(0).second(0);
    const arr = dep.add(1, 'hour').add(10, 'minute');
    flights.push(await Flight.create({
      companyId: uz.id, planeId: plane.id, originAirportId: tas.id, destinationAirportId: skd.id,
      flightNumber: `HY10${i}`, departureTime: dep.toDate(), arrivalTime: arr.toDate(), basePrice: '80.00', status: 'SCHEDULED',
    }));
    const dep2 = dayjs().add(i+1, 'day').hour(18).minute(0).second(0);
    const arr2 = dep2.add(1, 'hour').add(20, 'minute');
    flights.push(await Flight.create({
      companyId: uz.id, planeId: plane.id, originAirportId: tas.id, destinationAirportId: bhk.id,
      flightNumber: `HY20${i}`, departureTime: dep2.toDate(), arrivalTime: arr2.toDate(), basePrice: '90.00', status: 'SCHEDULED',
    }));
  }

  const adminPass = await bcrypt.hash('admin123', 10);
  const superAdmin = await User.create({ email: 'super@admin.uz', passwordHash: adminPass, role: 'SUPER_ADMIN', fullName: 'Super Admin' });
  const admin = await User.create({ email: 'admin@admin.uz', passwordHash: adminPass, role: 'ADMIN', fullName: 'Admin' });
  const user = await User.create({ email: 'user@user.uz', passwordHash: await bcrypt.hash('user123', 10), role: 'USER', fullName: 'User' });

  await News.bulkCreate([
    { title: 'New route TAS-SKD', slug: 'new-route-tas-skd', content: 'We opened a new route Tashkent-Samarkand', status: 'PUBLISHED', publishedAt: new Date() },
    { title: 'Fleet update', slug: 'fleet-update', content: 'We added new A320 aircraft', status: 'PUBLISHED', publishedAt: new Date() },
  ]);

  console.log('Seed done.');
  await sequelize.close();
}

run().catch(e => { console.error(e); process.exit(1); });
