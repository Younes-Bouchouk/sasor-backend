import { EventVisibility } from '@prisma/client';
import { IsInt, IsOptional, IsString, IsEnum, IsDate } from 'class-validator';

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  sport?: string;

  @IsOptional()
  @IsInt()
  maxParticipants?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(['PUBLIC', 'PRIVATE', 'FRIENDS'])
  visibility?: EventVisibility;

  @IsOptional()
  @IsDate()
  plannedAt?: Date;
  
  @IsString()
  @IsOptional()
  image?: string;
}
