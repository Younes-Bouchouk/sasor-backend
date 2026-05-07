// events-messages.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { EventsMessagesService } from './events-messages.service';
import { CreateEventsMessageDto } from './dto/create-events-message.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedRequest } from 'src/types/AuthUser';
import { EventsGateway } from './events.gateway'; // Ajouter l'import

@Controller('events/:eventId/messages')
export class EventsMessagesController {
  constructor(
    private readonly eventsMessagesService: EventsMessagesService,
    private readonly eventsGateway: EventsGateway, // Injecter le gateway
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async send(
    @Req() req: AuthenticatedRequest,
    @Param('eventId') eventId: number,
    @Body() createEventsMessageDto: CreateEventsMessageDto,
  ) {
    // Sauvegarder et récupérer le message complet
    const newMessage = await this.eventsMessagesService.send(
      req.user,
      +eventId,
      createEventsMessageDto,
    );
    
    //  BROADCAST via WebSocket à tous les clients
    // Envoyer à tous les clients (y compris l'émetteur sera ignoré côté front)
    this.eventsGateway.server.emit('newMessage', newMessage);
    
    return newMessage;
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Req() req: AuthenticatedRequest,
    @Param('eventId') eventId: number,
  ) {
    return this.eventsMessagesService.findAll(req.user, +eventId);
  }
}