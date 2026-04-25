import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { kMaxLength } from 'buffer';

@Injectable()
export class EventService {
    constructor(private prisma: PrismaService) {}
    /*
                          ! Créer un nouvel événement organisé par un utilisateur. */
    //via al methode POSTA joute un nouvel enregistrement dans la table event.
    async createEvent(userId: number, data: CreateEventDto) {
        const newEvent = await this.prisma.event.create({
            data: {
                organizerId: userId,
                ...data, // Les autres infos de l'événement (nom, date, etc.)
            },
        });

        const newParticipant = await this.prisma.eventParticipant.create({
            data: {
                participantId: userId,
                eventId: newEvent.id,
                canInvite: true,
            },
        });

        return {
            message: 'Création terminé avec succès !',
            event: newEvent,
            participant: newParticipant,
        };
    }
    /*
                          ! Récupérer tous les événements. */
    async getAllEvents(userId?: number) {
        //retourne toutes les lignes de la table event.
        const allEvents = await this.prisma.event.findMany({
            where: {
                OR: [{ visibility: 'PUBLIC' }, { visibility: 'FRIENDS' }],
            },
            include: {
                participation: {
                    where: {
                        participantId: userId,
                    },
                },
            },
        });
        return allEvents;
        const eventsFiltered = await Promise.all(
            allEvents.map(async (event) => {
                if (event.organizerId == userId) {
                    return null;
                }
                if (event.visibility == 'FRIENDS') {
                    const isFollower = await this.prisma.follow.findFirst({
                        where: {
                            followerId: userId,
                            followingId: event.organizerId,
                        },
                    });
                    if (!isFollower) return null;

                    const isFollowing = await this.prisma.follow.findFirst({
                        where: {
                            followerId: event.organizerId,
                            followingId: userId,
                        },
                    });
                    if (!isFollowing) return null;
                }
                return event;
            }),
        );

        return eventsFiltered.filter((event) => event !== null);
    }
    /*
    !  Récupérer les événements créés par un utilisateur spécifique. */
    async getUserEvents(userId: number) {
        // fitre les événements où organizerId correspond à l'userId donné.
        return await this.prisma.event.findMany({
            where: { organizerId: userId },
        });
    }

    /*
    !  Récupérer les événements créés par un utilisateur spécifique. */
    async getJoinedEvents(userId: number) {
        const participations = await this.prisma.eventParticipant.findMany({
            where: { participantId: userId },
            include: {
                event: true,
            },
        });

        const events = await Promise.all(
            participations.map(async (p) => {
                return {
                    ...p.event,
                    isOrganizer: p.participantId == p.event.organizerId,
                };
            }),
        );

        return events;
    }

    /*
    ! Récupérer les événements créés par mes follower  */
    async getFollowersEvents(userId: number) {
        // Récupérer les IDs des utilisateurs suivis
        const following = await this.prisma.follow.findMany({
            where: { followerId: userId },
            select: { followingId: true },
        });

        // Extraire les IDs des utilisateurs suivis
        const followingIds = following.map((f) => f.followingId);

        if (followingIds.length === 0) {
            return [];
        }

        // Récupérer les événements des utilisateurs suivis
        return await this.prisma.event.findMany({
            where: {
                organizerId: { in: followingIds },
                OR: [{ visibility: 'PUBLIC' }, { visibility: 'FRIENDS' }],
            },
            orderBy: { plannedAt: 'desc' }, // Trier par date
            include: {
                participation: {
                    where: {
                        participantId: userId,
                    },
                },
            },
        });
    }

    /*
                         ! trouver un seul evenement avec son id*/
    async getEventById(eventId: number) {
        return await this.prisma.event.findUnique({
            where: { id: Number(eventId) },
        });
    }
    /* 
                          !Modifier un événement existant.*/
    async updateEvent(eventId: number, data: UpdateEventDto) {
        return await this.prisma.event.update({
            where: { id: Number(eventId) }, // préciser le type number
            data: {
                ...data,
            },
        });
    }
    /* 
                          !Supprimer un événement.*/
    async deleteEvent(eventId: number) {
        // Étape 1: Supprimer les participants de l'événement
        await this.prisma.eventParticipant.deleteMany({
            where: { eventId: Number(eventId) },
        });

        // Étape 2: Supprimer l'événement
        return await this.prisma.event.delete({
            where: { id: Number(eventId) },
        });
    }

    /*
                          !Obtenir la liste des participants d'un événement.*/
    async getEventParticipants(eventId: number) {
        return await this.prisma.eventParticipant.findMany({
            where: { eventId: Number(eventId) },
            include: {
                participant: {
                    select: { id: true, pseudo: true, image: true },
                },
            },
        });
    }
    /*
                          !Ajouter un utilisateur comme participant à un événement.*/
    async joinEvent(userId: number, eventId: number) {
        // Récupérer l'événement
        const event = await this.prisma.event.findUnique({
            where: { id: Number(eventId) },
            select: { visibility: true },
        });

        if (!event) {
            return 'Événement introuvable.';
        }

        // Vérifier si l'événement est PUBLIC
        if (event.visibility === 'PUBLIC') {
            return await this.prisma.eventParticipant.create({
                data: { participantId: userId, eventId: Number(eventId) },
            });
        }

        // Vérifier si l'utilisateur est invité à l'événement
        const invitation = await this.prisma.eventInvitation.findFirst({
            where: {
                eventId: Number(eventId),
                inviteeId: Number(userId),
                status: 'ACCEPTED',
            },
        });

        if (!invitation) {
            return "Vous ne pouvez rejoindre cet événement que si vous êtes invité et que l'invitation a été acceptée.";
        }

        // Ajouter l'utilisateur à l'événement en tant que participant
        return await this.prisma.eventParticipant.create({
            data: { participantId: userId, eventId: eventId },
        });
    }

    /*
                      !Supprimer un utilisateur de la liste des participants.*/
    async leaveEvent(userId: number, eventId: number) {
        const deleteParticipant = await this.prisma.eventParticipant.deleteMany(
            {
                where: { participantId: userId, eventId: Number(eventId) },
            },
        );
        if (deleteParticipant.count == 1) {
            return "vous avez bien quitté l'événement";
        }
    }
}
