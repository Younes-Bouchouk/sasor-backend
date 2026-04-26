import { IsNotEmpty, IsString } from "class-validator";

export class DeleteFollowDto {
    @IsString()
    @IsNotEmpty({ message: "L'id du follow ne doit pas être vide" })
    followingId!: string
}
