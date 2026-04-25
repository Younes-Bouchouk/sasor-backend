import { Module } from '@nestjs/common';
import { EventsMessagesService } from './events-messages.service';
import { EventsMessagesController } from './events-messages.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [EventsMessagesController],
    providers: [EventsMessagesService],
})
export class EventsMessagesModule {}
