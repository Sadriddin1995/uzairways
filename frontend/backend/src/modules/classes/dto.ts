import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateClassDto {
  @ApiProperty({ example: 'ECONOMY' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'ECO' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ required: false, example: 1.5 })
  @IsOptional()
  @IsNumber()
  priceMultiplier?: number;
}

export class UpdateClassDto {
  @ApiProperty({ required: false, example: 'ECONOMY' })
  name?: string;

  @ApiProperty({ required: false, example: 'ECO' })
  code?: string;

  @ApiProperty({ required: false, example: 1.5 })
  @IsOptional()
  @IsNumber()
  priceMultiplier?: number;
}

