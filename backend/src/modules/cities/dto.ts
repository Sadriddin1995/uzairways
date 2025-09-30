import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCityDto {
  @ApiProperty({ example: 'Tashkent' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  countryId!: number;
}

export class UpdateCityDto {
  @ApiProperty({ required: false, example: 'Samarkand' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsInt()
  countryId?: number;
}

