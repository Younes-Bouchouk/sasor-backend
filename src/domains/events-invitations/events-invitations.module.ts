import { Module } from '@nestjs/common';
import { EventsInvitationsService } from './events-invitations.service';
import { EventsInvitationsController } from './events-invitations.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [EventsInvitationsController],
    providers: [EventsInvitationsService],
})
export class EventsInvitationsModule {}
