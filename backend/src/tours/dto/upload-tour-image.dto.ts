import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UploadTourImageDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  altText?: string;
}
