import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateEventsMessageDto } from './dto/create-events-message.dto';
import { UpdateEventsMessageDto } from './dto/update-events-message.dto';
import { UserTokenData } from 'src/types/AuthUser';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EventsMessagesService {
    constructor(private readonly prisma: PrismaService) {}

    /*
     * Permet à un utilisateur d'envoyer un message dans le chat d'un event.
     * Vérifie d'abord que l'event existe et que l'utilisateur y participe,
     * puis insère le message dans la table `eventMessage`.
     */
    async send(
        user: UserTokenData,
        eventId: number,
        createEventsMessageDto: CreateEventsMessageDto,
    ) {
        // On vérifie que l'event existe toujours
        const existingEvent = await this.checkEventExist(eventId);
        if (!existingEvent)
            throw new BadRequestException("L'event n'est plus disponible");

        // On vérifie que l'utilisateur participe à l'event
        const isParticipant = await this.checkEventParticipation(
            eventId,
            user.id,
        );
        if (!isParticipant)
            throw new BadRequestException('Vous ne partcipez pas à cet event');

        // Envoie du message
        const sendMessage = await this.prisma.eventMessage.create({
            data: {
                senderId: user.id,
                eventId,
                message: createEventsMessageDto.message,
            },
        });

        // Réponse
        return 'Message envoyé avec succès';
    }

    /*
     * Permet à un utilisateur de voir les messages dans le chat d'un event
     * Vérifie d'abord que l'event existe et que l'utilisateur y participe,
     * puis récupère les messages de l'event dans la table `eventMessage`.
     */
    async findAll(user: UserTokenData, eventId: number) {
        // On vérifie que l'event existe toujours
        await this.checkEventExist(eventId);

        // On vérifie que l'utilisateur participe à l'event
        await this.checkEventParticipation(eventId, user.id);

        // Récupère tous les messages de l'event
        return await this.prisma.eventMessage.findMany({
            where: { eventId },
            include: { sender: { select: { pseudo: true, image: true } } },
        });
    }

    /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
    /* - - - - - - - - - - FONCTIONS PRIVÉES - - - - - - - - - - */
    /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

    /*
     * Permet de vérifier si un event existe
     * en effectuant un requête dans la table 'event'
     * puis renvoie le résultat de la requête
     */
    private async checkEventExist(eventId: number) {
        return await this.prisma.event.findUnique({
            where: { id: eventId },
        });
    }

    /*
     * Permet de vérifier si utilisateur participe à un event
     * en effectuant un requête dans la table 'eventParticipant'
     * puis renvoie le résultat de la requête
     */
    private async checkEventParticipation(eventId: number, userId: number) {
        return await this.prisma.eventParticipant.findFirst({
            where: {
                eventId,
                participantId: userId,
            },
        });
    }
}
