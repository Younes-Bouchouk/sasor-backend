// events-messages.module.ts
import { Module } from '@nestjs/common';
import { EventsMessagesService } from './events-messages.service';
import { EventsMessagesController } from './events-messages.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EventsGateway } from './events.gateway'; // Ajouter

@Module({
  imports: [PrismaModule],
  controllers: [EventsMessagesController],
  providers: [EventsMessagesService, EventsGateway], // Ajouter EventsGateway
  exports: [EventsGateway], // Exporter pour l'utiliser ailleurs
})
export class EventsMessagesModule {}