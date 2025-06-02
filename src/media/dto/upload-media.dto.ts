import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray, IsBoolean } from 'class-validator';

export class UploadMediaDto {
  @ApiProperty({ description: 'Alt text for accessibility', required: false })
  @IsOptional()
  @IsString()
  altText?: string;

  @ApiProperty({ description: 'Tags for organization', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ description: 'Whether file should be public', required: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
