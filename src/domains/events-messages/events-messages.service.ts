import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateEventsMessageDto } from './dto/create-events-message.dto';
import { UpdateEventsMessageDto } from './dto/update-events-message.dto';
import { UserTokenData } from 'src/types/AuthUser';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EventsMessagesService {
    constructor(private readonly prisma: PrismaService) {}

    // events-messages.service.ts
async send(
  user: UserTokenData,
  eventId: number,
  createEventsMessageDto: CreateEventsMessageDto,
) {
  const existingEvent = await this.checkEventExist(eventId);
  if (!existingEvent)
    throw new BadRequestException("L'event n'est plus disponible");

  const isParticipant = await this.checkEventParticipation(eventId, user.id);
  if (!isParticipant)
    throw new BadRequestException('Vous ne partcipez pas à cet event');

  //  Récupérer le message créé avec les infos de l'utilisateur
  const newMessage = await this.prisma.eventMessage.create({
    data: {
      userId: user.id,
      eventId,
      message: createEventsMessageDto.message,
    },
    include: {
      sender: {
        select: {
          pseudo: true,
          profilePicture: true,
        },
      },
    },
  });

  //  Retourner l'objet complet, pas un simple texte
  return {
    id: newMessage.id,
    userId: newMessage.userId,
    eventId: newMessage.eventId,
    message: newMessage.message,
    createdAt: newMessage.createdAt,
    sender: newMessage.sender,
  };
}

    async findAll(user: UserTokenData, eventId: number) {
        await this.checkEventExist(eventId);
        await this.checkEventParticipation(eventId, user.id);

        return await this.prisma.eventMessage.findMany({
            where: { eventId },
            include: { sender: { select: { pseudo: true, profilePicture: true } } },
        });
    }

    private async checkEventExist(eventId: number) {
        return await this.prisma.event.findUnique({
            where: { id: eventId },
        });
    }

    private async checkEventParticipation(eventId: number, userId: string) {
        return await this.prisma.eventParticipant.findFirst({
            where: {
                eventId,
                userId,
            },
        });
    }
}
