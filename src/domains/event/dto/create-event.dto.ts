import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsBoolean, IsDate } from 'class-validator';

export class CreateEventDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  sportId: number;

  @IsInt()
  maxParticipants: number;

  @IsString()
  location: string;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean = false;

  @Type(() => Date)
  @IsDate({ message: "La date de l'event doit être au format ISO-8601" })
  startAt: Date;

  @IsString()
  @IsOptional()
  image?: string;
}
