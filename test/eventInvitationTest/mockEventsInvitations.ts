import { UserTokenData } from 'src/types/AuthUser';

export const mockInviter: UserTokenData = {
    id: 'user-organizer',
    pseudo: 'organisateur',
};

export const mockInviteeUser = {
    id: 'user-invite',
    pseudo: 'invite',
};

export const mockEventForInvite = {
    id: 1,
    userId: 'user-organizer',
    maxParticipants: 10,
};

export const mockPendingInvitation = {
    id: 1,
    eventId: 1,
    invitedById: 'user-organizer',
    userId: 'user-invite',
    status: 'PENDING',
};

export default function createPrismaMock() {
    return {
        event: {
            findUnique: jest.fn(),
        },
        user: {
            findUnique: jest.fn(),
        },
        eventParticipant: {
            findFirst: jest.fn(),
            create: jest.fn(),
            findMany: jest.fn(),
        },
        eventInvitation: {
            findFirst: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            findMany: jest.fn(),
        },
    };
}
