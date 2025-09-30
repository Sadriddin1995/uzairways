import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePlaneDto {
  @ApiProperty({ example: 'A320' })
  @IsString()
  @IsNotEmpty()
  model!: string;

  @ApiProperty({ example: 'A320-1' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  companyId!: number;
}

export class UpdatePlaneDto {
  @ApiProperty({ required: false, example: 'A320' })
  model?: string;

  @ApiProperty({ required: false, example: 'A320-1' })
  code?: string;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsInt()
  companyId?: number;
}
