import { IsDate, IsEmail, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserDto {

    @IsString()
    @IsNotEmpty({ message: "Le pseudo ne doit pas être vide" })
    pseudo: string

    @IsEmail({}, { message: "L'email n'est pas valide" })
    @IsNotEmpty({ message: "L'email ne doit pas être vide" })
    email: string

    @IsString()
    @Length(8, 20, { message: "Le mot de passe doit contenir entre 8 et 20 caractères"})
    @IsNotEmpty({ message: "Le mot de passe ne doit pas être vide" })
    password: string

    @Type(() => Date)
    @IsDate({ message: "La date de naissance doit être au format ISO-8601" })
    @IsNotEmpty({ message: "La date de naissance ne doit pas être vide" })
    birthday: Date

    @IsString()
    @IsOptional()
    image?: string;
}
