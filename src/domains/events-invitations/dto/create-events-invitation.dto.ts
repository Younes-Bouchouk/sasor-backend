import { IsString } from "class-validator";

export class CreateEventsInvitationDto {

    @IsString()
    inviteeId!: string

}
