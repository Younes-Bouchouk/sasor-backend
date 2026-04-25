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
    Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedRequest } from 'src/types/AuthUser';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    async findUsers(@Req() req: AuthenticatedRequest, @Query('search') query?: string) {
    if (query?.length) {
        return await this.usersService.searchByPseudo(query, req.user);
    }

    //return this.usersService.findAll();
    }

    // Parcourir les utilisateurs
    @Get()
    findAll() { 
        return this.usersService.findAll();
    }

    // Voir mon compte
    @UseGuards(JwtAuthGuard)
    @Get('me')
    findMe(@Req() req: AuthenticatedRequest) {
        return this.usersService.findMe(req.user);
    }

    // Voir un seul utilisateur
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(+id);
    }

    // Mettre à jour les infos de mon compte
    @UseGuards(JwtAuthGuard)
    @Patch('me')
    async update(@Req() req: AuthenticatedRequest, @Body() updateUserDto: UpdateUserDto) {
        return await this.usersService.update(req.user, updateUserDto);
    }

    // Supprimer mon compte
    @UseGuards(JwtAuthGuard)
    @Delete('me')
    remove(@Req() req: AuthenticatedRequest) {
        return this.usersService.remove(req.user);
    }
}
