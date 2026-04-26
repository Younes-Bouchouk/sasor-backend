import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateEventsInvitationDto } from './dto/create-events-invitation.dto';
import { UpdateEventsInvitationDto } from './dto/update-events-invitation.dto';
import { UserTokenData } from 'src/types/AuthUser';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EventsInvitationsService {
    constructor(private prisma: PrismaService) {}

    async create(
        user: UserTokenData,
        eventId: number,
        createEventsInvitationDto: CreateEventsInvitationDto,
    ) {
        const { inviteeId } = createEventsInvitationDto;

        if (user.id === inviteeId)
            throw new BadRequestException(
                'Vous ne pouvez pas vous inviter vous même',
            );

        const existingEvent = await this.prisma.event.findUnique({
            where: { id: eventId },
        });
        if (!existingEvent)
            throw new BadRequestException("L'event est indisponible");

        const existingInvitee = await this.prisma.user.findUnique({
            where: { id: inviteeId },
        });
        if (!existingInvitee)
            throw new BadRequestException(
                "L'utilisateur que vous essayé d'invité n'existe pas",
            );

        const alreadyParticipant = await this.prisma.eventParticipant.findFirst({
            where: { eventId, userId: inviteeId },
        });
        if (alreadyParticipant)
            throw new BadRequestException(
                `${existingInvitee.pseudo} fait déjà partie de l'event`,
            );

        const alreadyInvitedByYou = await this.prisma.eventInvitation.findFirst({
            where: { eventId, invitedById: user.id, userId: inviteeId },
        });
        if (alreadyInvitedByYou)
            throw new BadRequestException(
                `Vous avez déjà invité ${existingInvitee.pseudo} à rejoindre cet event`,
            );

        const isParticipant = await this.prisma.eventParticipant.findFirst({
            where: { eventId, userId: user.id },
        });
        if (!isParticipant)
            throw new BadRequestException(
                "Vous ne pouvez pas inviter si vous ne faites pas partie de l'event",
            );

        if (!isParticipant.canInvite)
            throw new BadRequestException(
                "Vous n'êtes pas autorisé à inviter qui que ce soit",
            );

        await this.prisma.eventInvitation.create({
            data: {
                eventId,
                invitedById: user.id,
                userId: inviteeId,
            },
        });

        return 'Invitation envoyé avec succès';
    }

    async findOneInvite(user: UserTokenData, invitationId: number) {
        const existingInvite = await this.prisma.eventInvitation.findUnique({
            where: { id: invitationId },
        });
        if (!existingInvite)
            throw new BadRequestException("L'invitation est introuvable");

        if (
            existingInvite.invitedById !== user.id &&
            existingInvite.userId !== user.id
        )
            throw new BadRequestException(
                "Vous n'êtes pas concerné par cette invitation",
            );

        return existingInvite;
    }

    findInvitationsReceived(user: UserTokenData) {
        return this.prisma.eventInvitation.findMany({
            where: { userId: user.id },
        });
    }

    findInvitationsSent(user: UserTokenData) {
        return this.prisma.eventInvitation.findMany({
            where: { invitedById: user.id },
        });
    }

    async acceptInvitation(user: UserTokenData, invitationId: number) {
        const invitation = await this.prisma.eventInvitation.findFirst({
            where: { id: invitationId },
        });
        if (!invitation)
            throw new BadRequestException("L'invitation est introuvable");

        if (invitation.userId !== user.id)
            throw new BadRequestException(
                "Vous n'êtes pas l'utilisateur invité à cet event",
            );

        if (invitation.status === 'ACCEPTED')
            throw new BadRequestException("L'invitation a déjà été accepté");

        if (['DECLINED', 'CANCELED'].includes(invitation.status))
            throw new BadRequestException("L'invitation n'est plus disponible");

        const event = await this.prisma.event.findUnique({
            where: { id: invitation.eventId },
        });
        if (!event) throw new BadRequestException('Event introuvable');

        const isParticipant = await this.prisma.eventParticipant.findFirst({
            where: { eventId: event.id, userId: user.id },
        });
        if (isParticipant)
            throw new BadRequestException("Vous participez déjà à l'event");

        const participants = await this.prisma.eventParticipant.findMany({
            where: { eventId: event.id },
        });

        if (participants.length >= event.maxParticipants)
            throw new BadRequestException("L'event est complet");

        await this.prisma.eventParticipant.create({
            data: { eventId: event.id, userId: user.id },
        });

        await this.prisma.eventInvitation.update({
            where: { id: invitationId },
            data: { status: 'ACCEPTED' },
        });

        return "Vous avez accepté l'invtation";
    }

    async declineInvitation(user: UserTokenData, invitationId: number) {
        const invitation = await this.prisma.eventInvitation.findFirst({
            where: { id: invitationId },
        });
        if (!invitation)
            throw new BadRequestException("L'invitation est introuvable");

        if (invitation.userId !== user.id)
            throw new BadRequestException(
                "Vous n'êtes pas l'utilisateur invité à cet event",
            );

        if (invitation.status === 'ACCEPTED')
            throw new BadRequestException("L'invitation a déjà été accepté");

        if (['DECLINED', 'CANCELED'].includes(invitation.status))
            throw new BadRequestException("L'invitation n'est plus disponible");

        const event = await this.prisma.event.findUnique({
            where: { id: invitation.eventId },
        });
        if (!event) throw new BadRequestException('Event introuvable');

        await this.prisma.eventInvitation.update({
            where: { id: invitationId },
            data: { status: 'DECLINED' },
        });

        return "Vous avez refusé l'invtation";
    }

    async cancelInvitation(user: UserTokenData, invitationId: number) {
        const invitation = await this.prisma.eventInvitation.findFirst({
            where: { id: invitationId },
        });
        if (!invitation)
            throw new BadRequestException("L'invitation est introuvable");

        if (invitation.invitedById !== user.id)
            throw new BadRequestException(
                "Vous n'êtes pas l'utilisateur qui a envoyé l'invitation",
            );

        if (invitation.status === 'CANCELED')
            throw new BadRequestException("L'invitation a déjà été annulé");

        if (['ACCEPTED', 'DECLINED'].includes(invitation.status))
            throw new BadRequestException("L'invitation a déjà été accpeté ou refusé");

        const canceledInvitation = await this.prisma.eventInvitation.update({
            where: { id: invitationId },
            data: { status: 'CANCELED' },
        });

        return {
            message: "Vous avez annulé l'invtation",
            invitation: canceledInvitation,
        };
    }
}
