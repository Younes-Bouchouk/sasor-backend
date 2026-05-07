// src/events/events.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EventsMessagesService } from './events-messages.service';

@WebSocketGateway({
  cors: {
    origin: '*', // À adapter en production
    credentials: true,
  },
  namespace: '/',
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly eventsMessagesService: EventsMessagesService) {}

  handleConnection(client: Socket) {
    console.log(`🔌 Client connecté: ${client.id}`);
    
    // Récupérer le token depuis l'auth
    const token = client.handshake.auth.token;
    if (token) {
      // Stocker l'userId dans le socket pour l'utiliser plus tard
      // Idéalement, décode le JWT ici
      console.log(`🔑 Client authentifié: ${client.id}`);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ Client déconnecté: ${client.id}`);
  }

  @SubscribeMessage('newMessage')
  async handleNewMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: any,
  ) {
    console.log('📡 Événement newMessage reçu:', payload);
    
    try {
      // Ici tu peux sauvegarder en base si ce n'est pas déjà fait
      // Ou simplement broadcaster le message reçu
      
      // 🔥 BROADCAST à TOUS les autres clients
      // Ne pas envoyer à l'émetteur pour éviter le doublon
      client.broadcast.emit('newMessage', payload);
      
      console.log('📡 Message broadcasté aux autres clients:', payload);
    } catch (error) {
      console.error('❌ Erreur lors du broadcast:', error);
    }
  }

  // Optionnel: Événement pour rejoindre une room spécifique à l'event
  @SubscribeMessage('joinEventRoom')
  handleJoinEventRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { eventId: string },
  ) {
    const room = `event-${data.eventId}`;
    client.join(room);
    console.log(`📌 Client ${client.id} a rejoint la room ${room}`);
    return { success: true, room };
  }

  // Optionnel: Quitter une room
  @SubscribeMessage('leaveEventRoom')
  handleLeaveEventRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { eventId: string },
  ) {
    const room = `event-${data.eventId}`;
    client.leave(room);
    console.log(`📌 Client ${client.id} a quitté la room ${room}`);
    return { success: true, room };
  }
}