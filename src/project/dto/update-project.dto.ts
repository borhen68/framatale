import { PartialType } from '@nestjs/swagger';
import { CreateProjectDto } from './create-project.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ProjectStatus } from '../schemas/project.schema';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @ApiProperty({ enum: ProjectStatus, description: 'Project status', required: false })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiProperty({ description: 'Whether project is public', required: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
