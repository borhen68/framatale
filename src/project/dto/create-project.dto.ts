import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsArray, IsNumber, Min } from 'class-validator';
import { ProductType } from '../../common/schemas/product-size.schema';

export class CreateProjectDto {
  @ApiProperty({ description: 'Project title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Project description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ProductType, description: 'Type of product' })
  @IsEnum(ProductType)
  type: ProductType;

  @ApiProperty({ description: 'Product size code' })
  @IsString()
  sizeCode: string;

  @ApiProperty({ description: 'Array of image IDs', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({ description: 'Total number of pages', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  totalPages?: number;

  @ApiProperty({ description: 'Project tags', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
