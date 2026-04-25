import { PartialType } from '@nestjs/mapped-types';
import { CreateEventsInvitationDto } from './create-events-invitation.dto';

export class UpdateEventsInvitationDto extends PartialType(CreateEventsInvitationDto) {}
