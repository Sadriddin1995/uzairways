import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PassengerDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  documentNumber!: string;
}

export class CreateTicketDto {
  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  flightId!: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  returnFlightId?: number;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  classId!: number;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  seatId!: number;

  @ApiProperty({ type: () => [PassengerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PassengerDto)
  passengers!: PassengerDto[];
}
