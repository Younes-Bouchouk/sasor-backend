import { BadRequestException } from '@nestjs/common';
import { FollowsService } from 'src/domains/follows/follows.service';
import { PrismaService } from 'src/prisma/prisma.service';
import createPrismaMock, {
    mockFollowRow,
    mockFollowUser,
    mockTargetUser,
} from './mockFollows';

describe('FollowsService', () => {
    let prismaMock: ReturnType<typeof createPrismaMock>;
    let service: FollowsService;

    beforeEach(() => {
        prismaMock = createPrismaMock();
        service = new FollowsService(prismaMock as unknown as PrismaService);
    });

    describe('create', () => {
        it('should create follow when both users exist', async () => {
            prismaMock.user.findUnique
                .mockResolvedValueOnce({
                    id: mockFollowUser.id,
                    pseudo: mockFollowUser.pseudo,
                } as never)
                .mockResolvedValueOnce(mockTargetUser as never);
            prismaMock.follow.findFirst.mockResolvedValue(null as never);
            prismaMock.follow.create.mockResolvedValue(mockFollowRow as never);

            const result = await service.create(
                { followingId: mockTargetUser.id },
                mockFollowUser,
            );

            expect(result).toBe("L'utilisateur a été suivie avec succès");
            expect(prismaMock.follow.create).toHaveBeenCalledWith({
                data: {
                    followerId: mockFollowUser.id,
                    followingId: mockTargetUser.id,
                },
            });
        });

        it('should reject following your own account', async () => {
            prismaMock.user.findUnique
                .mockResolvedValueOnce({
                    id: mockFollowUser.id,
                    pseudo: mockFollowUser.pseudo,
                } as never)
                .mockResolvedValueOnce({
                    id: mockFollowUser.id,
                    pseudo: mockFollowUser.pseudo,
                } as never);

            try {
                await service.create({ followingId: mockFollowUser.id }, mockFollowUser);
                throw new Error('expected BadRequestException');
            } catch (e) {
                expect(e).toBeInstanceOf(BadRequestException);
                expect((e as BadRequestException).getResponse()).toEqual(
                    expect.objectContaining({
                        message: expect.stringContaining('propre compte'),
                    }),
                );
            }
        });

        it('should reject duplicate follow', async () => {
            prismaMock.user.findUnique
                .mockResolvedValueOnce({
                    id: mockFollowUser.id,
                    pseudo: mockFollowUser.pseudo,
                } as never)
                .mockResolvedValueOnce(mockTargetUser as never);
            prismaMock.follow.findFirst.mockResolvedValue(mockFollowRow as never);

            try {
                await service.create(
                    { followingId: mockTargetUser.id },
                    mockFollowUser,
                );
                throw new Error('expected BadRequestException');
            } catch (e) {
                expect(e).toBeInstanceOf(BadRequestException);
                expect((e as BadRequestException).getResponse()).toEqual(
                    expect.objectContaining({
                        message: expect.stringContaining('suivez déjà'),
                    }),
                );
            }
        });
    });

    describe('remove', () => {
        it('should delete follow and confirm', async () => {
            prismaMock.follow.findFirst.mockResolvedValue(mockFollowRow as never);
            prismaMock.follow.delete.mockResolvedValue(mockFollowRow as never);

            const result = await service.remove(
                { followingId: mockTargetUser.id },
                mockFollowUser,
            );

            expect(result).toBe('Vous ne suivez plus ce compte');
            expect(prismaMock.follow.delete).toHaveBeenCalledWith({
                where: { id: mockFollowRow.id },
            });
        });
    });
});
