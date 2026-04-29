import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventService {
    constructor(private prisma: PrismaService) {}

    async createEvent(userId: string, data: CreateEventDto) {
        const newEvent = await this.prisma.event.create({
            data: {
                userId,
                ...data,
            },
        });

        const newParticipant = await this.prisma.eventParticipant.create({
            data: {
                userId,
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

    async getAllEvents(userId?: string) {
        return await this.prisma.event.findMany({
            where: {
                isPrivate: false,
            },
            include: {
                participants: {
                    include: {
                      participant: true,
                    },
                },
                organizer: {
                  select: {
                    id: true,
                    pseudo: true,
                    profilePicture: true,
                  }
                },
                sport: {
                  select: {
                    name: true
                  }
                }
            },
        });
    }

    async getUserEvents(userId: string) {
        return await this.prisma.event.findMany({
          where: { userId },
          include: {
            sport: {
              select: {
                name: true
              }
            }
          },
        });
    }

    async getJoinedEvents(userId: string) {
        const participations = await this.prisma.eventParticipant.findMany({
            where: { userId },
            include: {
                event: true,
            },
        });

        return participations.map((p) => ({
            ...p.event,
            isOrganizer: p.userId == p.event.userId,
        }));
    }

    async getFollowersEvents(userId: string) {
        const following = await this.prisma.follow.findMany({
            where: { followerId: userId },
            select: { followingId: true },
        });

        const followingIds = following.map((f) => f.followingId);

        if (followingIds.length === 0) {
            return [];
        }

        return await this.prisma.event.findMany({
            where: {
                userId: { in: followingIds },
                isPrivate: false,
            },
            orderBy: { startAt: 'desc' },
            include: {
                participants: {
                    where: { userId },
                },
            },
        });
    }

    async getEventById(eventId: number) {
        return await this.prisma.event.findUnique({
          where: { id: Number(eventId) },
          include: {
            participants: {
              include: {
                participant: true,
              },
            },
            organizer: {
              select: {
                id: true,
                pseudo: true  
              }
            },
            sport: {
              select: {
                name: true
              }
            }
          },
        });
    }

    async updateEvent(eventId: number, data: UpdateEventDto) {
        return await this.prisma.event.update({
            where: { id: Number(eventId) },
            data: { ...data },
        });
    }

    async deleteEvent(eventId: number) {
        await this.prisma.eventParticipant.deleteMany({
            where: { eventId: Number(eventId) },
        });

        return await this.prisma.event.delete({
            where: { id: Number(eventId) },
        });
    }

    async getEventParticipants(eventId: number) {
        return await this.prisma.eventParticipant.findMany({
            where: { eventId: Number(eventId) },
            include: {
                participant: {
                    select: { id: true, pseudo: true, profilePicture: true },
                },
            },
        });
    }

    async joinEvent(userId: string, eventId: number) {
        const event = await this.prisma.event.findUnique({
            where: { id: Number(eventId) },
            select: { isPrivate: true, maxParticipants: true },
        });

        const participantsCount = await this.prisma.eventParticipant.count({
            where: { eventId: Number(eventId) },
        });

        if (!event) {
            return 'Événement introuvable.';
        }

        const fullMessage = this.joinEventFullMessage(
            event.maxParticipants,
            participantsCount,
        );

        if (!event.isPrivate) {
            if (fullMessage) {
                return fullMessage;
            }

            return await this.prisma.eventParticipant.create({
                data: { userId, eventId: Number(eventId) },
            });
        }

        const invitation = await this.prisma.eventInvitation.findFirst({
            where: {
                eventId: Number(eventId),
                userId,
                status: 'ACCEPTED',
            },
        });

        if (!invitation) {
            return "Vous ne pouvez rejoindre cet événement que si vous êtes invité et que l'invitation a été acceptée.";
        }

        if (fullMessage) {
            return fullMessage;
        }

        return await this.prisma.eventParticipant.create({
            data: { userId, eventId },
        });
    }

    private joinEventFullMessage(
        maxParticipants: number,
        participantsCount: number,
    ): string | null {
        if (maxParticipants <= participantsCount) {
            return 'L\'événement est complet.';
        }
        return null;
    }

    async leaveEvent(userId: string, eventId: number) {
        const deleteParticipant = await this.prisma.eventParticipant.deleteMany({
            where: { userId, eventId: Number(eventId) },
        });
        if (deleteParticipant.count == 1) {
            return "vous avez bien quitté l'événement";
        }
    }
}
