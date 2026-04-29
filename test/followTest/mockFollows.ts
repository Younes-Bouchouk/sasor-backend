import { UserTokenData } from 'src/types/AuthUser';

export const mockFollowUser: UserTokenData = {
    id: 'user-follower',
    pseudo: 'follower',
};

export const mockTargetUser = {
    id: 'user-target',
    pseudo: 'cible',
};

export const mockFollowRow = {
    id: 1,
    followerId: 'user-follower',
    followingId: 'user-target',
};

export default function createPrismaMock() {
    return {
        user: {
            findUnique: jest.fn(),
        },
        follow: {
            findFirst: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
            findMany: jest.fn(),
        },
    };
}
