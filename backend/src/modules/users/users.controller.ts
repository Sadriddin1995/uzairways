import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { AdjustBalanceDto, UpdateMeDto, CreateUserDto, UpdateUserAdminDto } from './dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: any) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMe(@Req() req: any, @Body() body: UpdateMeDto) {
    return this.users.updateMe(req.user.id, body);
  }

  // Admin/Super admin endpoints
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get()
  list() { return this.users.list(); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) { return this.users.findById(id); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post()
  async create(@Req() req: any, @Body() dto: CreateUserDto) {
    const email = String(dto.email).trim().toLowerCase();
    const user = await this.users.create(email, dto.password, dto.fullName);
    if (dto.role) {
      const desired = dto.role;
      if (desired === 'SUPER_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
        // ignore elevation to SUPER_ADMIN by non super admins
      } else {
        await this.users.setRole(user.id, desired);
      }
    }
    return { id: user.id, email: user.email, fullName: user.fullName, role: user.role };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch(':id')
  async update(@Req() req: any, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserAdminDto) {
    const user = await this.users.findById(id);
    if (!user) return null;
    if (dto.fullName !== undefined) await this.users.updateMe(id, { fullName: dto.fullName });
    if (dto.role) {
      if (dto.role === 'SUPER_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
        // prevent elevation to SUPER_ADMIN by non super admins
      } else {
        await this.users.setRole(id, dto.role);
      }
    }
    if (dto.password) await this.users.updatePassword(id, dto.password);
    return await this.users.findById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.users.remove(id);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post(':id/balance')
  adjustBalance(@Param('id', ParseIntPipe) id: number, @Body() body: AdjustBalanceDto) {
    const mode = body.mode ?? 'increment';
    return this.users.adjustBalance(id, body.amount, mode);
  }
}
