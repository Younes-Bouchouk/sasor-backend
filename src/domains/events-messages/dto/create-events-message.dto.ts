import { IsNotEmpty, IsString } from "class-validator";

export class CreateEventsMessageDto {

    @IsString()
    @IsNotEmpty({ message: "Le message à envoyer ne doit pas être vide "})
    message: string
}
