import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateNewsDto {
  @ApiProperty({ example: 'New route TAS-SKD' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'new-route-tas-skd' })
  @IsString()
  slug!: string;

  @ApiProperty({ example: 'We opened a new route Tashkent-Samarkand' })
  @IsString()
  content!: string;

  @ApiProperty({ enum: ['DRAFT', 'PUBLISHED'], default: 'DRAFT', example: 'DRAFT' })
  @IsIn(['DRAFT', 'PUBLISHED'])
  status!: 'DRAFT' | 'PUBLISHED';

  @ApiProperty({ required: false, type: String, example: '2025-10-01T12:00:00.000Z' })
  @Type(() => Date)
  @IsOptional()
  publishedAt?: Date;
}

export class UpdateNewsDto {
  @ApiProperty({ required: false, example: 'Fleet update' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false, example: 'fleet-update' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ required: false, example: 'We added new A320 aircraft' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ required: false, enum: ['DRAFT', 'PUBLISHED'], example: 'PUBLISHED' })
  @IsOptional()
  @IsIn(['DRAFT', 'PUBLISHED'])
  status?: 'DRAFT' | 'PUBLISHED';

  @ApiProperty({ required: false, type: String })
  @Type(() => Date)
  @IsOptional()
  publishedAt?: Date;
}
