import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class AdjustBalanceDto {
  @ApiProperty({ example: 50.0 })
  @IsNumber()
  @IsNotEmpty()
  amount!: number;

  @ApiProperty({ required: false, enum: ['increment', 'set'], default: 'increment' })
  @IsOptional()
  @IsIn(['increment', 'set'])
  mode?: 'increment' | 'set';
}

export class UpdateMeDto {
  @ApiProperty({ required: false, example: 'Ali Valiyev' })
  @IsOptional()
  @IsString()
  fullName?: string;
}

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ required: false, example: 'John Doe' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ required: false, enum: ['USER', 'ADMIN', 'SUPER_ADMIN'], example: 'USER' })
  @IsOptional()
  @IsIn(['USER', 'ADMIN', 'SUPER_ADMIN'])
  role?: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
}

export class UpdateUserAdminDto {
  @ApiProperty({ required: false, example: 'Jane Doe' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ required: false, enum: ['USER', 'ADMIN', 'SUPER_ADMIN'], example: 'ADMIN' })
  @IsOptional()
  @IsIn(['USER', 'ADMIN', 'SUPER_ADMIN'])
  role?: 'USER' | 'ADMIN' | 'SUPER_ADMIN';

  @ApiProperty({ required: false, example: 'newpass123' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}
