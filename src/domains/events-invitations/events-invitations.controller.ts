import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Req,
} from '@nestjs/common';
import { EventsInvitationsService } from './events-invitations.service';
import { CreateEventsInvitationDto } from './dto/create-events-invitation.dto';
import { UpdateEventsInvitationDto } from './dto/update-events-invitation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedRequest } from 'src/types/AuthUser';

@Controller('events')
export class EventsInvitationsController {
    constructor(
        private readonly eventsInvitationsService: EventsInvitationsService,
    ) {}

    @UseGuards(JwtAuthGuard)
    @Post('/:eventId/invitations')
    create(
        @Req() req: AuthenticatedRequest,
        @Param('eventId') eventId: string,
        @Body() createEventsInvitationDto: CreateEventsInvitationDto,
    ) {
        return this.eventsInvitationsService.create(
            req.user,
            +eventId,
            createEventsInvitationDto,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get('invitations/received')
    findInvitationsReceived(
        @Req() req: AuthenticatedRequest,
    ) {
        return this.eventsInvitationsService.findInvitationsReceived(req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Get('invitations/sent')
    findInvitationsSent(
        @Req() req: AuthenticatedRequest,
    ) {
        return this.eventsInvitationsService.findInvitationsSent(req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Get('invitations/:invitationId')
    findOneInvite(
        @Req() req: AuthenticatedRequest,
        @Param('invitationId') invitationId: string,
    ) {
        return this.eventsInvitationsService.findOneInvite(req.user, +invitationId);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('invitations/:invitationId/accept')
    acceptInvitation(
        @Req() req: AuthenticatedRequest,
        @Param('invitationId') invitationId: string,
    ) {
        return this.eventsInvitationsService.acceptInvitation(req.user, +invitationId);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('invitations/:invitationId/decline')
    declineInvitation(
        @Req() req: AuthenticatedRequest,
        @Param('invitationId') invitationId: string,
    ) {
        return this.eventsInvitationsService.declineInvitation(req.user, +invitationId);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('invitations/:invitationId/cancel')
    cancelInvitation(
        @Req() req: AuthenticatedRequest,
        @Param('invitationId') invitationId: string,
    ) {
        return this.eventsInvitationsService.cancelInvitation(req.user, +invitationId);
    }

    
}
