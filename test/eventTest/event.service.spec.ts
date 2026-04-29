import { EventService } from 'src/domains/event/event.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEventDto } from 'src/domains/event/dto/create-event.dto';
import createPrismaMock, { mockPublicEvent, mockParticipant, mockPrivateEvent } from './mockEvent';



describe('EventService', () => {
    let prismaMock: ReturnType<typeof createPrismaMock>;
    let eventService: EventService;

    const createEventDto: CreateEventDto = {
        name: 'Test Event',
        description: 'Test Description',
        sportId: 1,
        maxParticipants: 10,
        location: 'Test Location',
        isPrivate: false,
        startAt: new Date('2026-06-01T10:00:00.000Z'),
    };

    beforeEach(() => {
        prismaMock = createPrismaMock();
        eventService = new EventService(prismaMock as unknown as PrismaService);
    });

    

    describe('createEvent', () => {
        it('should create an event and register the organizer as participant and organizer', async () => {
            prismaMock.event.create.mockResolvedValue(mockPublicEvent as never);
            prismaMock.eventParticipant.create.mockResolvedValue(mockParticipant as never);

            const result = await eventService.createEvent('user-1', createEventDto);

            expect(result).toEqual({
                message: 'Création terminé avec succès !',
                event: mockPublicEvent,
                participant: mockParticipant,
            });
        });
    });

    describe('joinPublicEvent', () => {
        it('should join an event', async () => {
            prismaMock.event.findUnique.mockResolvedValue({
                isPrivate: false,
                maxParticipants: mockPublicEvent.maxParticipants,
            } as never);
            prismaMock.eventParticipant.count.mockResolvedValue(3 as never);
            prismaMock.eventParticipant.create.mockResolvedValue(mockParticipant as never);

            const result = await eventService.joinEvent(mockParticipant.userId, mockPublicEvent.id);

            expect(result).toEqual(mockParticipant);
        });
    });

    describe('joinFullEvent', () => {
        it('should return an error if the event is full', async () => {
            prismaMock.event.findUnique.mockResolvedValue({
                isPrivate: false,
                maxParticipants: mockPublicEvent.maxParticipants,
            } as never);
            prismaMock.eventParticipant.count.mockResolvedValue(mockPublicEvent.maxParticipants as never);

            const result = await eventService.joinEvent(mockParticipant.userId, mockPublicEvent.id);

            expect(result).toEqual('L\'événement est complet.');
        });
    });

    describe('joinPrivateEvent', () => {
        it('should return an error if the user is not invited', async () => {
            prismaMock.event.findUnique.mockResolvedValue({
                isPrivate: true,
                maxParticipants: mockPrivateEvent.maxParticipants,
            } as never);
            prismaMock.eventParticipant.count.mockResolvedValue(0 as never);
            prismaMock.eventInvitation.findFirst.mockResolvedValue(null as never);

            const result = await eventService.joinEvent(mockParticipant.userId, mockPrivateEvent.id);

            expect(result).toEqual(
                'Vous ne pouvez rejoindre cet événement que si vous êtes invité et que l\'invitation a été acceptée.',
            );
        });

        it('should reject join when private event is full after invitation', async () => {
            prismaMock.event.findUnique.mockResolvedValue({
                isPrivate: true,
                maxParticipants: mockPrivateEvent.maxParticipants,
            } as never);
            prismaMock.eventParticipant.count.mockResolvedValue(mockPrivateEvent.maxParticipants as never);
            prismaMock.eventInvitation.findFirst.mockResolvedValue({
                id: 1,
                eventId: mockPrivateEvent.id,
                userId: mockParticipant.userId,
                status: 'ACCEPTED',
            } as never);

            const result = await eventService.joinEvent(mockParticipant.userId, mockPrivateEvent.id);

            expect(result).toEqual('L\'événement est complet.');
        });
    });
});
