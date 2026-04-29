import { BadRequestException, Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { hash, compare } from 'bcryptjs'
import { UserTokenData } from 'src/types/AuthUser';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService, 
        private readonly jwtService: JwtService
    ) {}
    
    async register(registerDto: RegisterDto) {
        const { pseudo, email, password, birthday } = registerDto;

        const existingUser = await this.prisma.user.findUnique({ where: { email: email } });

        console.log("Email déjà existant:", existingUser)

        if (existingUser) throw new BadRequestException("L'email est déjà utilisé");

        const existingPseudo = await this.prisma.user.findUnique({ where: { pseudo: pseudo } });

        console.log("Pseudo déjà existant:", existingPseudo)

        if (existingPseudo) throw new BadRequestException("Le pseudo est déjà utilisé");

        const hashedPassword = await hash(password, 10);

        const createdUser = await this.prisma.user.create({
            data: {
                pseudo,
                email,
                password: hashedPassword,
                birthday: new Date(birthday),
                sexe: registerDto.sexe
            }
        });

        console.log("Utilisateur créé:", createdUser)

        const payload: UserTokenData = { id: createdUser.id, pseudo: createdUser.pseudo };
        
        return this.authenticateUser(payload)
    }
    async login(loginDto: LoginDto) {
        const existingUser = await this.prisma.user.findUnique({ where: { email: loginDto.email } });
        if (!existingUser) throw new BadRequestException("L'email ne correspond à aucun compte")

        console.log("utilisateur existant:", existingUser)

        const isPasswordValid = await compare(loginDto.password, existingUser.password);
        if (!isPasswordValid) throw new BadRequestException('Le mot de passe est incorrect');

        console.log("mot de passe correct")

        const payload: UserTokenData = { id: existingUser.id, pseudo: existingUser.pseudo };
        
        return this.authenticateUser(payload)
    }
    private authenticateUser(payload: UserTokenData) {
        return {
            access_token: this.jwtService.sign(payload)
        }
    }
}
