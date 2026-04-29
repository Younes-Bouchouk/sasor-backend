import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Req,
    UseGuards,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedRequest } from 'src/types/AuthUser';

@Controller('events')
export class EventController {
    constructor(private readonly eventService: EventService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Req() req, @Body() createEventDto: CreateEventDto) {
        return this.eventService.createEvent(req.user.id, createEventDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    getAll(@Req() req: AuthenticatedRequest) {
        return this.eventService.getAllEvents(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getJoinedEvents(@Req() req: AuthenticatedRequest) {
        return this.eventService.getJoinedEvents(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('organized')
    getOrganizedEvents(@Req() req: AuthenticatedRequest) {
      return this.eventService.getOrganizedEvents(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('followers')
    getFollowersEvents(@Req() req: AuthenticatedRequest) {
        return this.eventService.getFollowersEvents(req.user.id);
    }

    @Get(':eventId')
    getEvent(@Param('eventId') eventId: number) {
        return this.eventService.getEventById(eventId);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':eventId')
    update(
        @Param('eventId') eventId: number,
        @Body() updateEventDto: UpdateEventDto,
    ) {
        return this.eventService.updateEvent(eventId, updateEventDto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':eventId')
    delete(@Param('eventId') eventId: number) {
        return this.eventService.deleteEvent(eventId);
    }

    @Get(':eventId/participants')
    getParticipants(@Param('eventId') eventId: number) {
        return this.eventService.getEventParticipants(eventId);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':eventId/join')
    join(@Req() req, @Param('eventId') eventId: number) {
        return this.eventService.joinEvent(req.user.id, eventId);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':eventId/exit')
    exit(@Req() req, @Param('eventId') eventId: number) {
        return this.eventService.leaveEvent(req.user.id, eventId);
    }
}
