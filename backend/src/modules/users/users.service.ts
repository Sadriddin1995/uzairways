import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.model';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User) private userModel: typeof User) {}

  async create(email: string, password: string, fullName?: string) {
    if (!email) throw new BadRequestException('Email is required');
    if (!password) throw new BadRequestException('Password is required');
    const normalized = String(email).trim().toLowerCase();
    const exists = await this.userModel.findOne({ where: { email: normalized } });
    if (exists) throw new BadRequestException('This email is already registered');
    const passwordHash = await bcrypt.hash(password, 10);
    return this.userModel.create({ email: normalized, passwordHash, fullName: fullName ?? null });
  }

  async findById(id: number) {
    return this.userModel.findByPk(id);
  }

  async list() {
    return this.userModel.findAll({ order: [['id', 'ASC']] });
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ where: { email } });
  }

  async setRole(userId: number, role: 'USER' | 'ADMIN' | 'SUPER_ADMIN') {
    const user = await this.findById(userId);
    if (!user) throw new Error('User not found');
    user.role = role;
    await user.save();
    return user;
  }

  async adjustBalance(userId: number, amount: number, mode: 'increment' | 'set' = 'increment') {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    if (typeof amount !== 'number' || Number.isNaN(amount)) throw new BadRequestException('Invalid amount');
    const current = Number(user.balance || 0);
    const next = mode === 'set' ? amount : current + amount;
    if (next < 0) throw new BadRequestException('Balance cannot be negative');
    user.balance = next.toFixed(2);
    await user.save();
    return user;
  }

  async updateMe(userId: number, data: { fullName?: string }) {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    if (typeof data.fullName === 'string') user.fullName = data.fullName;
    await user.save();
    return user;
  }

  async updatePassword(userId: number, newPassword: string) {
    if (!newPassword) throw new BadRequestException('Password is required');
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    return user;
  }

  async remove(id: number) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    await user.destroy();
    return { success: true };
  }

  async findAdmins() {
    return this.userModel.findAll({ where: { role: 'ADMIN' }, order: [['id', 'ASC']] });
  }

  async findAdminById(id: number) {
    const u = await this.userModel.findByPk(id);
    if (!u || u.role !== 'ADMIN') throw new NotFoundException('Admin not found');
    return u;
  }
}
