import { BadRequestException } from '@nestjs/common';
import { EventsInvitationsService } from 'src/domains/events-invitations/events-invitations.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserTokenData } from 'src/types/AuthUser';
import createPrismaMock, {
    mockEventForInvite,
    mockInviteeUser,
    mockInviter,
    mockPendingInvitation,
} from './mockEventsInvitations';

describe('EventsInvitationsService', () => {
    let prismaMock: ReturnType<typeof createPrismaMock>;
    let service: EventsInvitationsService;

    const inviteeToken: UserTokenData = {
        id: mockInviteeUser.id,
        pseudo: mockInviteeUser.pseudo,
    };

    beforeEach(() => {
        prismaMock = createPrismaMock();
        service = new EventsInvitationsService(prismaMock as unknown as PrismaService);
    });

    describe('create', () => {
        it('should create invitation when inviter can invite', async () => {
            prismaMock.event.findUnique.mockResolvedValue(mockEventForInvite as never);
            prismaMock.user.findUnique.mockResolvedValue(mockInviteeUser as never);
            prismaMock.eventParticipant.findFirst
                .mockResolvedValueOnce(null as never)
                .mockResolvedValueOnce({ canInvite: true } as never);
            prismaMock.eventInvitation.findFirst.mockResolvedValue(null as never);
            prismaMock.eventInvitation.create.mockResolvedValue({} as never);

            const result = await service.create(mockInviter, mockEventForInvite.id, {
                inviteeId: mockInviteeUser.id,
            });

            expect(result).toBe('Invitation envoyé avec succès');
            expect(prismaMock.eventInvitation.create).toHaveBeenCalledWith({
                data: {
                    eventId: mockEventForInvite.id,
                    invitedById: mockInviter.id,
                    userId: mockInviteeUser.id,
                },
            });
        });

        it('should reject self-invitation', async () => {
            try {
                await service.create(mockInviter, mockEventForInvite.id, {
                    inviteeId: mockInviter.id,
                });
                throw new Error('expected BadRequestException');
            } catch (e) {
                expect(e).toBeInstanceOf(BadRequestException);
                expect((e as BadRequestException).getResponse()).toEqual(
                    expect.objectContaining({
                        message: expect.stringContaining('vous inviter vous même'),
                    }),
                );
            }
        });

        it('should reject when inviter is not an event participant', async () => {
            prismaMock.event.findUnique.mockResolvedValue(mockEventForInvite as never);
            prismaMock.user.findUnique.mockResolvedValue(mockInviteeUser as never);
            prismaMock.eventParticipant.findFirst
                .mockResolvedValueOnce(null as never)
                .mockResolvedValueOnce(null as never);
            prismaMock.eventInvitation.findFirst.mockResolvedValue(null as never);

            try {
                await service.create(mockInviter, mockEventForInvite.id, {
                    inviteeId: mockInviteeUser.id,
                });
                throw new Error('expected BadRequestException');
            } catch (e) {
                expect(e).toBeInstanceOf(BadRequestException);
                expect((e as BadRequestException).getResponse()).toEqual(
                    expect.objectContaining({
                        message: expect.stringContaining("ne faites pas partie de l'event"),
                    }),
                );
            }
        });
    });

    describe('acceptInvitation', () => {
        it('should add participant and mark invitation accepted', async () => {
            prismaMock.eventInvitation.findFirst.mockResolvedValue(
                mockPendingInvitation as never,
            );
            prismaMock.event.findUnique.mockResolvedValue(mockEventForInvite as never);
            prismaMock.eventParticipant.findFirst.mockResolvedValue(null as never);
            prismaMock.eventParticipant.findMany.mockResolvedValue([] as never);
            prismaMock.eventParticipant.create.mockResolvedValue({} as never);
            prismaMock.eventInvitation.update.mockResolvedValue({} as never);

            const result = await service.acceptInvitation(inviteeToken, 1);

            expect(result).toBe("Vous avez accepté l'invtation");
            expect(prismaMock.eventParticipant.create).toHaveBeenCalledWith({
                data: { eventId: mockEventForInvite.id, userId: inviteeToken.id },
            });
            expect(prismaMock.eventInvitation.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { status: 'ACCEPTED' },
            });
        });
    });
});
