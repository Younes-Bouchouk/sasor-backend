import {
    Controller,
    Post,
    Body,
    Delete,
    Get,
    UseGuards,
    Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthenticatedRequest } from 'src/types/AuthUser';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    async authenticate(@Req() req: AuthenticatedRequest) {
        return req.user
    }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        console.log("Route pour créer un compte")
        return await this.authService.register(registerDto);
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return await this.authService.login(loginDto);
    }

    @Delete('logout')
    logout() {
        return '';
    }
}
