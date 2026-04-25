import { EventVisibility } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsEnum, IsDate } from 'class-validator';

export class CreateEventDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  sport: string;

  @IsInt()
  maxParticipants: number;

  @IsString()
  location: string;

  @IsOptional()
  @IsEnum(['PUBLIC', 'PRIVATE', 'FRIENDS'])
  visibility?: EventVisibility = 'PUBLIC';

  @Type(() => Date)
  @IsDate({ message: "La date de l'event doit être au format ISO-8601" })
  plannedAt: Date;

  @IsString()
  @IsOptional()
  image?: string; 
}
