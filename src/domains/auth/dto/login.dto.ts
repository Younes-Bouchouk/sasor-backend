import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class LoginDto {

    @IsEmail({}, { message: "L'email n'est pas valide" })
    @IsNotEmpty({ message: "L'email ne doit pas être vide" })
    email: string

    @IsString()
    @Length(8, 20, { message: "Le mot de passe doit contenir entre 8 et 20 caractères"})
    @IsNotEmpty({ message: "Le mot de passe ne doit pas être vide" })
    password: string

}
