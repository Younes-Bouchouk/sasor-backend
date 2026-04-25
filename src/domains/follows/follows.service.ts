import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateFollowDto } from './dto/create-follow.dto';
import { UserTokenData } from 'src/types/AuthUser';
import { PrismaService } from 'src/prisma/prisma.service';
import { DeleteFollowDto } from './dto/delete-follow.dto';

@Injectable()
export class FollowsService {
    constructor(private readonly prisma: PrismaService) {}

    /*
     * Permet de suivre un autre utilisateur
     * Vérifie si les utilisateurs existent
     * Vérifie si les utilisateurs sont différents
     * Vérifie que l'utilisateur le suis déjà'
     * puis insère le suivis dans la table 'follow'
     */
    async create(createFollowDto: CreateFollowDto, user: UserTokenData) {
        // Vérifier que l'utilisateur qui suit existe
        const existingFollower = await this.checkUserExist(user.id);
        if (!existingFollower)
            throw new BadRequestException("Le compte du suiveur n'existe pas");

        // Vérifier que l'utilisateur à suivre existe
        const existingFollowing = await this.checkUserExist(
            createFollowDto.followingId,
        );
        if (!existingFollowing)
            throw new BadRequestException("Le compte à suivre n'existe pas");

        // Empêche l'utilisateur de se suivre lui même
        if (existingFollower.id === existingFollowing.id)
            throw new BadRequestException("Vous ne pouvez pas suivre votre propre compte")

        // Vérifier si l'utilisateur est déjà suivit
        const alreadyFollow = await this.prisma.follow.findFirst({
            where: {
                followingId: createFollowDto.followingId,
                followerId: user.id,
            },
        });
        if (alreadyFollow)
            throw new BadRequestException('Vous suivez déjà cet utilisateur');

        // Création du suivis
        const newFollow = await this.prisma.follow.create({
            data: {
                followerId: user.id,
                followingId: createFollowDto.followingId,
            },
        });
        return "L'utilisateur a été suivie avec succès";
    }

    /*
     * Permet de récupérer la liste des comptes qui suivent l'utilisateur connecté
     */
    findMyFollowers(user: UserTokenData) {
        return this.findFollowersByUserId(user.id);
    }

    /*
     * Permet de récupérer la liste des comptes que l'utilisateur connecté suit
     */
    findMyFollowing(user: UserTokenData) {
        return this.findFollowingByUserId(user.id);
    }

    /*
     * Permet de récupérer la liste des comptes qui suivent un utilisateur
     */
    findUserFollowers(userId: number) {
        return this.findFollowersByUserId(userId);
    }

    /*
     * Permet de récupérer la liste des comptes qu'un utilisateur suit
     */
    findUserFollowing(userId: number) {
        return this.findFollowingByUserId(userId);
    }

    /*
     * Permet de à un utilisateur de ne plus suivre un autre qu'il suivait
     * Vérifie d'abord si le suivis existe
     * Effectue une requête dans la table 'follows' pour supprimer la ligne
     */
    async remove(deleteFollowDto: DeleteFollowDto, user: UserTokenData) {
        const Follow = await this.prisma.follow.findFirst({
            where: {
                followingId: deleteFollowDto.followingId,
                followerId: user.id,
            },
        });
        if (!Follow)
            throw new BadRequestException('Vous ne suiver pas ce compte');
        const deletefollow = await this.prisma.follow.delete({
            where: {
                id: Follow.id,
            },
        });
        return 'Vous ne suivez plus ce compte';
    }

    /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
    /* - - - - - - - - - - FONCTIONS PRIVÉES - - - - - - - - - - */
    /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

    // Vérifie si un utilisateur existe dans la table 'user'
    private async checkUserExist(userId: number) {
        return await this.prisma.user.findUnique({
            where: { id: userId },
        });
    }

    /*
     * Permet de récupérer la liste des comptes qu'un utilisateur suit
     * requête effectué dans la table 'follow'
     * Retourne uniquement leurs id et leurs pseudos
     */
    private async findFollowersByUserId(userId: number) {
        return this.prisma.follow.findMany({
            where: {
                followingId: userId,
            },
            include: {
                follower: {
                    select: { id: true, pseudo: true, image: true  },
                },
            },
        });
    }

    /*
     * Permet de récupérer la liste des comptes qu'un utilisateur suit
     * requête effectué dans la table 'follow'
     * Retourne uniquement leurs id et leurs pseudos
     */
    private async findFollowingByUserId(userId: number) {
        return this.prisma.follow.findMany({
            where: {
                followerId: userId,
            },
            include: {
                following: {
                    select: { id: true, pseudo: true, image: true },
                },
            },
        });
    }
}
