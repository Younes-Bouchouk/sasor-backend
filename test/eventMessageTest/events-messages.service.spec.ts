import { BadRequestException } from '@nestjs/common';
import { EventsMessagesService } from 'src/domains/events-messages/events-messages.service';
import { PrismaService } from 'src/prisma/prisma.service';
import createPrismaMock, {
    mockEventRow,
    mockMessageUser,
    mockMessagesList,
    mockParticipantRow,
} from './mockEventsMessages';

describe('EventsMessagesService', () => {
    let prismaMock: ReturnType<typeof createPrismaMock>;
    let service: EventsMessagesService;

    beforeEach(() => {
        prismaMock = createPrismaMock();
        service = new EventsMessagesService(prismaMock as unknown as PrismaService);
    });

    describe('send', () => {
        it('should persist message when user participates', async () => {
            prismaMock.event.findUnique.mockResolvedValue(mockEventRow as never);
            prismaMock.eventParticipant.findFirst.mockResolvedValue(
                mockParticipantRow as never,
            );
            prismaMock.eventMessage.create.mockResolvedValue({} as never);

            const result = await service.send(mockMessageUser, mockEventRow.id, {
                message: 'Hello',
            });

            expect(result).toBe('Message envoyé avec succès');
            expect(prismaMock.eventMessage.create).toHaveBeenCalledWith({
                data: {
                    userId: mockMessageUser.id,
                    eventId: mockEventRow.id,
                    message: 'Hello',
                },
            });
        });

        it('should reject when event does not exist', async () => {
            prismaMock.event.findUnique.mockResolvedValue(null as never);

            try {
                await service.send(mockMessageUser, 999, { message: 'x' });
                throw new Error('expected BadRequestException');
            } catch (e) {
                expect(e).toBeInstanceOf(BadRequestException);
                expect((e as BadRequestException).getResponse()).toEqual(
                    expect.objectContaining({
                        message: expect.stringContaining("n'est plus disponible"),
                    }),
                );
            }
        });

        it('should reject when user is not a participant', async () => {
            prismaMock.event.findUnique.mockResolvedValue(mockEventRow as never);
            prismaMock.eventParticipant.findFirst.mockResolvedValue(null as never);

            try {
                await service.send(mockMessageUser, mockEventRow.id, { message: 'x' });
                throw new Error('expected BadRequestException');
            } catch (e) {
                expect(e).toBeInstanceOf(BadRequestException);
                expect((e as BadRequestException).getResponse()).toEqual(
                    expect.objectContaining({
                        message: expect.stringContaining('ne partcipez pas'),
                    }),
                );
            }
        });
    });

    describe('findAll', () => {
        it('should return messages for participants', async () => {
            prismaMock.event.findUnique.mockResolvedValue(mockEventRow as never);
            prismaMock.eventParticipant.findFirst.mockResolvedValue(
                mockParticipantRow as never,
            );
            prismaMock.eventMessage.findMany.mockResolvedValue(mockMessagesList as never);

            const result = await service.findAll(mockMessageUser, mockEventRow.id);

            expect(result).toEqual(mockMessagesList);
            expect(prismaMock.eventMessage.findMany).toHaveBeenCalledWith({
                where: { eventId: mockEventRow.id },
                include: {
                    sender: { select: { pseudo: true, profilePicture: true } },
                },
            });
        });
    });
});
