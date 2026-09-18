import { TourStatus } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTourDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  location: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsInt()
  @Min(1)
  durationDays: number;

  @IsOptional()
  @IsEnum(TourStatus)
  status?: TourStatus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];
}
