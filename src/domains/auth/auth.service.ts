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

    // Permet de s'inscrire
    async register(registerDto: RegisterDto) {
        const { pseudo, email, password, confirmPassword, birthday } =
            registerDto;

        // Je vérifie si les champs 'mot de passe' et 'confirmer mot de passe' sont différents
        if (password !== confirmPassword) throw new BadRequestException('Les mots de passe sont différents');

        // Je créer une variable dans laquelle j'effectue une requête pour récupérer un utilisateur avec l'email saisie
        const existingUser = await this.prisma.user.findUnique({ where: { email: email } });

        // Si un utilisateur avec le même email existe, je retour l'erreur
        if (existingUser) throw new BadRequestException("L'email est déjà utilisé");

                // Je créer une variable dans laquelle j'effectue une requête pour récupérer un utilisateur avec l'email saisie
                const existingPseudo = await this.prisma.user.findUnique({ where: { pseudo: pseudo } });

                // Si un utilisateur avec le même email existe, je retour l'erreur
                if (existingPseudo) throw new BadRequestException("Le pseudo est déjà utilisé");

        const hashedPassword = await hash(password, 10);

        // Sinon, j'effectue la requête qui me permet de créer une nouvelle ligne dans la table User
        const createdUser = await this.prisma.user.create({
            data: {
                pseudo,
                email,
                password: hashedPassword,
                birthday: new Date(birthday),
                sexe: registerDto.sexe
            }
        });

        // Stocker les informations dans le token
        const payload: UserTokenData = { id: createdUser.id, pseudo: createdUser.pseudo };
        
        // Création du token
        return this.authenticateUser(payload)
    }

    // Permet de se connecter
    async login(loginDto: LoginDto) {
        // Vérifie que l'user existe
        const existingUser = await this.prisma.user.findUnique({ where: { email: loginDto.email } });
        if (!existingUser) throw new BadRequestException("L'email ne correspond à aucun compte")

        // Vérifier le mot de passe est correcte
        const isPasswordValid = await compare(loginDto.password, existingUser.password);
        if (!isPasswordValid) throw new BadRequestException('Le mot de passe est incorrect');

        // Stocker les informations dans le token
        const payload: UserTokenData = { id: existingUser.id, pseudo: existingUser.pseudo };
        
        // Création du token
        return this.authenticateUser(payload)
    }

    // Permet de générer le token pour l'utilisateur
    private authenticateUser(payload: UserTokenData) {
        return {
            access_token: this.jwtService.sign(payload)
        }
    }
}
