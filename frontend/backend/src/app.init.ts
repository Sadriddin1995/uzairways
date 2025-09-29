import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { UsersService } from './modules/users/users.service';
import { Sequelize } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';

@Injectable()
export class AppInitService implements OnModuleInit {
  private readonly logger = new Logger(AppInitService.name);
  constructor(private users: UsersService, private sequelize: Sequelize) {}

  async onModuleInit() {
    
    try {
      const qi = this.sequelize.getQueryInterface();
      const desc = await qi.describeTable('users');
      if (!('balance' in desc)) {
        await qi.addColumn('users', 'balance', {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0,
        } as any);
        this.logger.log('Added users.balance column');
      }
      
    } catch (e) {
      this.logger.warn(`Startup schema check failed: ${e}`);
    }

    // Add flights.class_pricing if missing
    try {
      const qi = this.sequelize.getQueryInterface();
      const descFlights: any = await qi.describeTable('flights');
      if (!('class_pricing' in descFlights)) {
        await qi.addColumn('flights', 'class_pricing', {
          type: DataTypes.JSONB,
          allowNull: true,
        } as any);
        this.logger.log('Added flights.class_pricing column');
      }
    } catch (e) {
      this.logger.warn(`Startup flights schema check failed: ${e}`);
    }

    try {
      await this.sequelize.sync();
      this.logger.log('Sequelize sync ensured (create missing tables)');
    } catch (e) {
      this.logger.warn(`Sequelize sync failed: ${e}`);
    }

    const email = process.env.SUPERADMIN_EMAIL || 'super@admin.uz';
    const password = process.env.SUPERADMIN_PASSWORD || 'admin123';
    const name = process.env.SUPERADMIN_NAME || 'Super Admin';
    const existing = await this.users.findByEmail(email);
    if (!existing) {
      const user = await this.users.create(email, password, name);
      await this.users.setRole(user.id, 'SUPER_ADMIN');
      this.logger.log(`Super admin created: ${email}`);
    } else if (existing.role !== 'SUPER_ADMIN') {
      await this.users.setRole(existing.id, 'SUPER_ADMIN');
      this.logger.log(`Super admin ensured: ${email}`);
    } else {
      this.logger.log('Super admin already exists');
    }
  }
}
