import { UserTokenData } from 'src/types/AuthUser';

export const mockMessageUser: UserTokenData = {
    id: 'user-1',
    pseudo: 'testeur',
};

export const mockEventRow = {
    id: 1,
    name: 'Match',
    maxParticipants: 10,
};

export const mockParticipantRow = {
    id: 1,
    userId: 'user-1',
    eventId: 1,
    canInvite: false,
};

export const mockMessagesList = [
    {
        id: 1,
        userId: 'user-1',
        eventId: 1,
        message: 'Salut',
        sender: { pseudo: 'testeur', profilePicture: null as string | null },
    },
];

export default function createPrismaMock() {
    return {
        event: {
            findUnique: jest.fn(),
        },
        eventParticipant: {
            findFirst: jest.fn(),
        },
        eventMessage: {
            create: jest.fn(),
            findMany: jest.fn(),
        },
    };
}
