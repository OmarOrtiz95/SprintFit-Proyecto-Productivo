import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { EmailProvider } from '../email/email.provider';
import { EmailVerificationService } from '../email/email-verification.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private emailProvider: EmailProvider,
        private emailVerificationService: EmailVerificationService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(email);
        if (user && (await bcrypt.compare(pass, user.passwordHash))) {
            const { passwordHash, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = {
            email: user.email,
            sub: user.id,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
            }
        };
    }

    async register(userData: any) {
        const user = await this.usersService.create(userData);
        const token = await this.emailVerificationService.createToken(user.id);
        await this.emailProvider.sendVerificationEmail(user.email, token);
        return this.login(user);
    }

    async verifyEmail(token: string) {
        const result = await this.emailVerificationService.verifyToken(token);
        if (!result) {
            throw new UnauthorizedException('Invalid or expired verification token');
        }
        const user = await this.usersService.findById(result.userId);
        return this.login(user);
    }

    async getProfile(userId: number) {
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        const { passwordHash, ...safeUser } = user;
        return safeUser;
    }
}
