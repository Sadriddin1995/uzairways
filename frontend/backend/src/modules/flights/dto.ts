import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsIn, IsInt, IsNotEmpty, IsNumberString, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchFlightsDto {
  @ApiProperty({ example: 'TAS' })
  origin!: string; 

  @ApiProperty({ example: 'SKD' })
  destination!: string; 

  @ApiProperty({ example: '2025-10-01' })
  date!: string; 

  @ApiProperty({ required: false, example: '2025-10-10' })
  returnDate?: string;

  @ApiProperty({ required: false, enum: ['oneway', 'round'], example: 'oneway' })
  trip?: 'oneway' | 'round';

  @ApiProperty({ required: false, example: 'ECO' })
  cabin?: string; 

  @ApiProperty({ required: false, example: 1 })
  adults?: number;
}

export class CreateFlightDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  companyId!: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @IsNotEmpty()
  planeId!: number;

  @ApiProperty({ example: 3 })
  @IsInt()
  @IsNotEmpty()
  originAirportId!: number;

  @ApiProperty({ example: 4 })
  @IsInt()
  @IsNotEmpty()
  destinationAirportId!: number;

  @ApiProperty({ example: 'HY123' })
  @IsString()
  @IsNotEmpty()
  flightNumber!: string;

  @ApiProperty({ type: String, example: '2025-10-01T09:00:00.000Z' })
  @Type(() => Date)
  @IsDate()
  departureTime!: Date;

  @ApiProperty({ type: String, example: '2025-10-01T10:10:00.000Z' })
  @Type(() => Date)
  @IsDate()
  arrivalTime!: Date;

  @ApiProperty({ required: false, example: '80.00' })
  @IsOptional()
  @IsNumberString()
  basePrice?: string;

  @ApiProperty({ enum: ['SCHEDULED', 'CANCELLED'], default: 'SCHEDULED', required: false, example: 'SCHEDULED' })
  @IsOptional()
  @IsIn(['SCHEDULED', 'CANCELLED'])
  status?: 'SCHEDULED' | 'CANCELLED';

  @ApiProperty({ required: false, type: Array, description: 'Optional per-class pricing and seat limits: [{ classId, price, seatLimit }]' })
  @IsOptional()
  classPricing?: { classId: number; price?: string; seatLimit?: number }[];
}

export class UpdateFlightDto {
  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsInt()
  companyId?: number;

  @ApiProperty({ required: false, example: 2 })
  @IsOptional()
  @IsInt()
  planeId?: number;

  @ApiProperty({ required: false, example: 3 })
  @IsOptional()
  @IsInt()
  originAirportId?: number;

  @ApiProperty({ required: false, example: 4 })
  @IsOptional()
  @IsInt()
  destinationAirportId?: number;

  @ApiProperty({ required: false, example: 'HY123' })
  @IsOptional()
  flightNumber?: string;

  @ApiProperty({ required: false, type: String, example: '2025-10-01T09:00:00.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  departureTime?: Date;

  @ApiProperty({ required: false, type: String, example: '2025-10-01T10:10:00.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  arrivalTime?: Date;

  @ApiProperty({ required: false, example: '80.00' })
  @IsOptional()
  @IsNumberString()
  basePrice?: string;

  @ApiProperty({ required: false, enum: ['SCHEDULED', 'CANCELLED'], example: 'SCHEDULED' })
  @IsOptional()
  @IsIn(['SCHEDULED', 'CANCELLED'])
  status?: 'SCHEDULED' | 'CANCELLED';
}


