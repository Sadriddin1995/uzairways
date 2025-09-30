import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAirportDto {
  @ApiProperty({ example: 'Tashkent International' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'TAS' })
  @IsString()
  @IsNotEmpty()
  iata!: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  cityId!: number;
}

export class UpdateAirportDto {
  @ApiProperty({ required: false, example: 'Tashkent International' })
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false, example: 'TAS' })
  @IsOptional()
  iata?: string;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsInt()
  cityId?: number;
}
