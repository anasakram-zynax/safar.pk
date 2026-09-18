import { IsOptional, IsString, MaxLength } from 'class-validator';
export class UpdateTourImageDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  altText?: string;
}
