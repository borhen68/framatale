import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsArray, IsNumber, IsOptional, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductType } from '../../common/schemas/product-size.schema';
import { ImageSlot, TextSlot, BackgroundElement } from '../schemas/layout-template.schema';

export class CreateTemplateDto {
  @ApiProperty({ description: 'Template name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Template description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ProductType, description: 'Product type' })
  @IsEnum(ProductType)
  productType: ProductType;

  @ApiProperty({ description: 'Template category' })
  @IsString()
  category: string;

  @ApiProperty({ description: 'Template tags', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ description: 'Number of image slots' })
  @IsNumber()
  imageCount: number;

  @ApiProperty({ description: 'Preferred orientation', required: false })
  @IsOptional()
  @IsEnum(['portrait', 'landscape', 'square', 'mixed'])
  preferredOrientation?: 'portrait' | 'landscape' | 'square' | 'mixed';

  @ApiProperty({ description: 'Image slots configuration' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  imageSlots: ImageSlot[];

  @ApiProperty({ description: 'Text slots configuration', required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  textSlots?: TextSlot[];

  @ApiProperty({ description: 'Background configuration', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  background?: BackgroundElement;

  @ApiProperty({ description: 'Whether template is premium', required: false })
  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;

  @ApiProperty({ description: 'Template difficulty', required: false })
  @IsOptional()
  @IsEnum(['beginner', 'intermediate', 'advanced'])
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}
