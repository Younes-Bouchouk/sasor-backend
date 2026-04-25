import { PartialType } from '@nestjs/mapped-types';
import { CreateEventsMessageDto } from './create-events-message.dto';

export class UpdateEventsMessageDto extends PartialType(CreateEventsMessageDto) {}
