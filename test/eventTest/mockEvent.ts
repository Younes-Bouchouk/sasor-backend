export const mockParticipant = {
    id: 1,
    userId: 'user-1',
    eventId: 1,
    canInvite: true,
};

export const mockParticipantArray = [mockParticipant, mockParticipant, mockParticipant];

export const mockPublicEvent = {
    id: 1,
    name: 'Test Event Public',
    description: 'Test Description',
    sportId: 1,
    maxParticipants: 10,
    location: 'Test Location',
    isPrivate: false,
    participants: [mockParticipantArray],
};

export const mockPrivateEvent = {
    id: 1,
    name: 'Test Event Private',
    description: 'Test Description',
    sportId: 1,
    maxParticipants: 10,
    location: 'Test Location',
    isPrivate: true,
    participants: [mockParticipantArray],
};

export const LoginTestFALSE = {
    email: 'test@test.com',
    password: 'test',
}

export const LoginTestTRUE = {
    email: 'test@test.com',
    password: 'Azerty123',
}


export default function createPrismaMock() {
    return {
        event: {
            create: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        eventParticipant: {
            create: jest.fn(),
            count: jest.fn(),
            findMany: jest.fn(),
            deleteMany: jest.fn(),
        },
        eventInvitation: {
            findFirst: jest.fn(),
        },
        follow: {
            findMany: jest.fn(),
        },
    };
}
