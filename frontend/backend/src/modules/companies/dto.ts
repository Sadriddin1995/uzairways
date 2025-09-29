import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({ example: 'UzAirways' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'HY' })
  @IsString()
  @IsNotEmpty()
  code!: string;
}

export class UpdateCompanyDto {
  @ApiProperty({ required: false, example: 'UzAirways' })
  name?: string;

  @ApiProperty({ required: false, example: 'HY' })
  code?: string;
}

