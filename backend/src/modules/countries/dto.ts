import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateCountryDto {
  @ApiProperty({ example: 'Uzbekistan' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'UZ', description: 'ISO alpha-2 code' })
  @IsString()
  @Length(2, 2)
  isoCode!: string;
}

export class UpdateCountryDto {
  @ApiProperty({ required: false, example: 'Uzbekistan' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false, example: 'UZ', description: 'ISO alpha-2 code' })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  isoCode?: string;
}

