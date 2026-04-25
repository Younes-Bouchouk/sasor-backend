import { IsNumber } from "class-validator";

export class CreateEventsInvitationDto {

    @IsNumber()
    inviteeId: number

}
