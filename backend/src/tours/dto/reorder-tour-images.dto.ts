import { ArrayMinSize, IsArray, IsString } from 'class-validator';
export class ReorderTourImagesDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  imageIds: string[];
}
