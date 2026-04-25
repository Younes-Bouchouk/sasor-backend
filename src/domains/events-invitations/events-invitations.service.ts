import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateEventsInvitationDto } from './dto/create-events-invitation.dto';
import { UpdateEventsInvitationDto } from './dto/update-events-invitation.dto';
import { UserTokenData } from 'src/types/AuthUser';
import { PrismaService } from 'src/prisma/prisma.service';
import { throws } from 'assert';

@Injectable()
export class EventsInvitationsService {
    constructor(private prisma: PrismaService) {}

    // Fonction pour envoyer une invitation
    async create(
        user: UserTokenData,
        eventId: number,
        createEventsInvitationDto: CreateEventsInvitationDto,
    ) {
        // Récupérer les variables du DTO
        const { inviteeId } = createEventsInvitationDto;

        // Vérfier que l'utilisateur ne s'invite pas lui même mddrrr
        if (user.id === inviteeId)
            throw new BadRequestException(
                'Vous ne pouvez pas vous inviter vous même',
            );

        // Vérifier que l'event existe
        const existingEvent = await this.prisma.event.findUnique({
            where: { id: eventId },
        });
        if (!existingEvent)
            throw new BadRequestException("L'event est indisponible");

        // Vérfier que l'utilisateur à inviter existe
        const existingInvitee = await this.prisma.user.findUnique({
            where: { id: inviteeId },
        });
        if (!existingInvitee)
            throw new BadRequestException(
                "L'utilisateur que vous essayé d'invité n'existe pas",
            );

        // Vérifier si l'utilisateur à inviter participe à l'event
        const alreadyParticipant = await this.prisma.eventParticipant.findFirst(
            {
                where: { eventId, participantId: inviteeId },
            },
        );
        if (alreadyParticipant)
            throw new BadRequestException(
                `${existingInvitee.pseudo} fait déjà partie de l'event`,
            );

        // Vérifier si l'utilisateur a déjà été invité par moi
        const alreadyInvitedByYou = await this.prisma.eventInvitation.findFirst(
            {
                where: { eventId, inviterId: user.id, inviteeId },
            },
        );
        if (alreadyInvitedByYou)
            throw new BadRequestException(
                `Vous avez déjà invité ${existingInvitee.pseudo} à rejoindre cet event`,
            );

        // Vérfier si l'utilisateur fais partie lui même partit de l'event
        const isParticipant = await this.prisma.eventParticipant.findFirst({
            where: {
                eventId,
                participantId: user.id,
            },
        });
        if (!isParticipant)
            throw new BadRequestException(
                "Vous ne pouvez pas inviter si vous ne faites pas partie de l'event",
            );

        //Vérfier si l'utilisateur est autoriser à inviter
        if (!isParticipant.canInvite)
            throw new BadRequestException(
                "Vous n'êtes pas autorisé à inviter qui que ce soit",
            );

        await this.prisma.eventInvitation.create({
            data: {
                eventId,
                inviterId: user.id,
                inviteeId,
            },
        });

        return 'Invitation envoyé avec succès';
    }

    // Permet d'afficher les infos d'une invitation
    async findOneInvite(user: UserTokenData, invitationId: number) {
        // Vérfier que l'invitation existe
        const existingInvite = await this.prisma.eventInvitation.findUnique({
            where: { id: invitationId },
        });
        if (!existingInvite)
            throw new BadRequestException("L'invitation est introuvable");

        // Vérifier que l'utilisateur est soit l'inviteur ou l'invité
        if (
            existingInvite.inviterId !== user.id &&
            existingInvite.inviteeId !== user.id
        )
            throw new BadRequestException(
                "Vous n'êtes pas concerné par cette invitation",
            );

        return existingInvite;
    }

    // Permet de voir les invitations reçues de l'utilisateur connecté
    findInvitationsReceived(user: UserTokenData) {
        return this.prisma.eventInvitation.findMany({
            where: { inviteeId: user.id },
        });
    }

    // Permet de voir les invitations envoyées de l'utilisateur connecté
    findInvitationsSent(user: UserTokenData) {
        return this.prisma.eventInvitation.findMany({
            where: { inviterId: user.id },
        });
    }

    // Permet d'accepter une invitation reçue
    async acceptInvitation(user: UserTokenData, invitationId: number) {
        // Vérifier si l'invitation existe bien
        const invitation = await this.prisma.eventInvitation.findFirst({
            where: { id: invitationId },
        });
        if (!invitation)
            throw new BadRequestException("L'invitation est introuvable");

        // Vérifier si l'utilisateur invité est l'utilisateur connecté
        if (invitation.inviteeId !== user.id)
            throw new BadRequestException(
                "Vous n'êtes pas l'utilisateur invité à cet event",
            );

        // Vérifier si l'invitation a déjà été accepté
        if (invitation.status === 'ACCEPTED')
            throw new BadRequestException("L'invitation a déjà été accepté");

        // Vérifier si l'invitation a déjà été refusé ou annulé
        if (['DECLINED', 'CANCELED'].includes(invitation.status))
            throw new BadRequestException("L'invitation n'est plus disponible");

        // Vérfier si l'event existe bien
        const event = await this.prisma.event.findUnique({
            where: { id: invitation.eventId },
        });
        if (!event) throw new BadRequestException('Event introuvable');

        // Vérifier si l'utilisateur participe déjà à l'event
        const isParticipant = await this.prisma.eventParticipant.findFirst({
            where: { eventId: event.id, participantId: user.id },
        });
        if (isParticipant)
            throw new BadRequestException("Vous participez déjà à l'event");

        // Récupère la liste des participants de l'event
        const particpants = await this.prisma.eventParticipant.findMany({
            where: { id: event.id },
        });

        // Vérifier si l'event est complet
        if (particpants.length >= event.maxParticipants)
            throw new BadRequestException("L'event est complet");

        
        // Ajoute l'utilisateur en tant que participant de l'event
        await this.prisma.eventParticipant.create({
            data: {
                eventId: event.id,
                participantId: user.id,
            },
        });
        
        // Change le status de l'invitation en 'ACCEPTED'
        await this.prisma.eventInvitation.update({
            where: { id: invitationId },
            data: { status: 'ACCEPTED' },
        });

        return "Vous avez accepté l'invtation";
    }

    // Permet d'accepter une invitation reçue
    async declineInvitation(user: UserTokenData, invitationId: number) {
        // Vérifier si l'invitation existe bien
        const invitation = await this.prisma.eventInvitation.findFirst({
            where: { id: invitationId },
        });
        if (!invitation)
            throw new BadRequestException("L'invitation est introuvable");

        // Vérifier si l'utilisateur invité est l'utilisateur connecté
        if (invitation.inviteeId !== user.id)
            throw new BadRequestException(
                "Vous n'êtes pas l'utilisateur invité à cet event",
            );

        // Vérifier si l'invitation a déjà été accepté
        if (invitation.status === 'ACCEPTED')
            throw new BadRequestException("L'invitation a déjà été accepté");

        // Vérifier si l'invitation a déjà été refusé ou annulé
        if (['DECLINED', 'CANCELED'].includes(invitation.status))
            throw new BadRequestException("L'invitation n'est plus disponible");

        // Vérfier si l'event existe bien
        const event = await this.prisma.event.findUnique({
            where: { id: invitation.eventId },
        });
        if (!event) throw new BadRequestException('Event introuvable'); 

        // Vérifier si l'utilisateur participe déjà à l'event
        const isParticipant = await this.prisma.eventParticipant.findFirst({
            where: { eventId: event.id, participantId: user.id },
        });
        if (isParticipant)
            throw new BadRequestException("Vous participez déjà à l'event");

        // Ajoute l'utilisateur en tant que participant de l'event
        await this.prisma.eventParticipant.create({
            data: {
                eventId: event.id,
                participantId: user.id,
            },
        });

        // Change le status de l'invitation en 'ACCEPTED'
        await this.prisma.eventInvitation.update({
            where: { id: invitationId },
            data: { status: 'DECLINED' },
        });


        return "Vous avez refusé l'invtation";
    }

    // Permet d'accepter une invitation reçue
    async cancelInvitation(user: UserTokenData, invitationId: number) {
        // Vérifier si l'invitation existe bien
        const invitation = await this.prisma.eventInvitation.findFirst({
            where: { id: invitationId },
        });
        if (!invitation)
            throw new BadRequestException("L'invitation est introuvable");

        // Vérifier si l'utilisateur invité est l'utilisateur connecté
        if (invitation.inviterId !== user.id)
            throw new BadRequestException(
                "Vous n'êtes pas l'utilisateur qui a envoyé l'invitation",
            );
        
        if (invitation.status === 'CANCELED')
            throw new BadRequestException("L'invitation a déjà été annulé");

        if (['ACCEPTED', 'DECLINED'].includes(invitation.status))
            throw new BadRequestException("L'invitation a déjà été accpeté ou refusé");


        // Change le status de l'invitation en 'CANCELED'
        const canceledInvitation = await this.prisma.eventInvitation.update({
            where: { id: invitationId },
            data: { status: 'CANCELED' },
        });


        return {
            message: "Vous avez annulé l'invtation",
            invitation: canceledInvitation
        };
    }
}
