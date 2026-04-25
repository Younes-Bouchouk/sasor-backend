import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Req,
} from '@nestjs/common';
import { FollowsService } from './follows.service';
import { CreateFollowDto } from './dto/create-follow.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedRequest } from 'src/types/AuthUser';
import { DeleteFollowDto } from './dto/delete-follow.dto';

@Controller('follows')
export class FollowsController {
    constructor(private readonly followsService: FollowsService) {}

    // Route pour suivre un autre utilisateur
    @UseGuards(JwtAuthGuard)
    @Post('me')
    create(
        @Body() createFollowDto: CreateFollowDto,
        @Req() req: AuthenticatedRequest,
    ) {
        return this.followsService.create(createFollowDto, req.user);
    }

    // Route pour consulter les comptes qui me suivent
    @UseGuards(JwtAuthGuard)
    @Get('/me/followers')
    findMyFollowers(@Req() req: AuthenticatedRequest) {
        return this.followsService.findMyFollowers(req.user);
    }

    // Route pour consulter les comptes que je suis
    @UseGuards(JwtAuthGuard)
    @Get('/me/following')
    findMyFollowing(@Req() req: AuthenticatedRequest) {
        return this.followsService.findMyFollowing(req.user);
    }

    // Route pour consulter les comptes qui suivent un utilisateur
    @Get('/:userId/followers')
    findUserFollowers(@Param('userId') userId: string) {
        return this.followsService.findUserFollowers(+userId);
    }

    // Route pour consulter les comptes qu'un utilisateur suit
    @Get('/:userId/following')
    findUserFollowing(@Param('userId') userId: string) {
        return this.followsService.findUserFollowing(+userId);
    }

    // Route pour ne plus suivre un utilisateur
    @UseGuards(JwtAuthGuard)
    @Delete('me')
    unfollow(
        @Body() deleteFollowDto: DeleteFollowDto,
        @Req() req: AuthenticatedRequest,
    ) {
        console.log("Ne plus follow")
        return this.followsService.remove(deleteFollowDto, req.user);
    }
}
