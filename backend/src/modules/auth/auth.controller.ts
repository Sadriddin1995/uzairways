import { Body, Controller, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import { ApiStandardResponses } from '../../common/swagger-responses';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';

class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  fullName!: string;
}

class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password!: string;
}

@ApiTags('auth')
@ApiStandardResponses()
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService, private users: UsersService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const user = await this.users.create(dto.email, dto.password, dto.fullName);
    return { id: user.id, email: user.email, fullName: user.fullName, role: user.role };
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.auth.validateUser(dto.email, dto.password);
    return this.auth.login(user);
  }

  @Post('admin/login')
  async loginAdmin(@Body() dto: LoginDto) {
    const user = await this.auth.validateUser(dto.email, dto.password);
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      throw new UnauthorizedException('Admin only');
    }
    return this.auth.login(user);
  }

  

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN')
  @Post('admin/register')
  async registerAdmin(@Body() dto: RegisterDto) {
    const email = String(dto.email).trim().toLowerCase();
    const existing = await this.users.findByEmail(email);
    if (existing) {
      await this.users.setRole(existing.id, 'ADMIN');
      if (dto.fullName) await this.users.updateMe(existing.id, { fullName: dto.fullName });
      if (dto.password) await this.users.updatePassword(existing.id, dto.password);
      const updated = await this.users.findById(existing.id);
      return { id: updated!.id, email: updated!.email, fullName: updated!.fullName, role: updated!.role };
    }
    const user = await this.users.create(email, dto.password, dto.fullName);
    await this.users.setRole(user.id, 'ADMIN');
    return { id: user.id, email: user.email, fullName: user.fullName, role: 'ADMIN' };
  }
}
