import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsBoolean, IsDate } from 'class-validator';

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  sportId?: number;

  @IsOptional()
  @IsInt()
  maxParticipants?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startAt?: Date;

  @IsString()
  @IsOptional()
  image?: string;
}
