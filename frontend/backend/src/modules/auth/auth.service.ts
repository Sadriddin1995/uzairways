import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.model';

@Injectable()
export class AuthService {
  constructor(private users: UsersService, private jwt: JwtService) {}

  async validateUser(email: string, pass: string): Promise<User> {
    const user = await this.users.findByEmail(email);
    if (!user) throw new UnauthorizedException('User not found');
    const ok = await bcrypt.compare(pass, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Wrong password');
    return user;
  }

  async login(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role, fullName: user.fullName };
    return {
      access_token: this.jwt.sign(payload),
      user: { id: user.id, email: user.email, role: user.role, fullName: user.fullName },
    };
  }
}
