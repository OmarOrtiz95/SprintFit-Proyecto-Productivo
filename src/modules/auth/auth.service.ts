import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { EmailService } from './email.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private emailService: EmailService,
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
        const payload = { email: user.email, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role
            }
        };
    }

    async register(userData: any) {
        const user = await this.usersService.create(userData);
        await this.emailService.sendVerificationEmail(user.id, user.email);
        return this.login(user);
    }

    async verifyEmail(token: string) {
        const verified = await this.emailService.verifyEmailToken(token);
        if (!verified) {
            throw new UnauthorizedException('Invalid or expired verification token');
        }
        return { message: 'Email successfully verified' };
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
