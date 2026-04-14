import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);

    constructor(private prisma: PrismaService) {}

    async sendVerificationEmail(userId: number, email: string): Promise<void> {
        // Generate a simple token
        const token = crypto.randomBytes(32).toString('hex');
        
        // Save to database
        await this.prisma.emailVerification.create({
            data: {
                userId,
                token,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            }
        });

        // Mock send email
        const verificationUrl = `http://localhost:5173/verify-email?token=${token}`;
        this.logger.log(`[MOCK EMAIL] To: ${email}`);
        this.logger.log(`[MOCK EMAIL] Subject: Verifica tu cuenta en SprintFit`);
        this.logger.log(`[MOCK EMAIL] Body: Haz clic en el siguiente enlace para verificar tu correo: ${verificationUrl}`);
    }

    async verifyEmailToken(token: string): Promise<boolean> {
        const verification = await this.prisma.emailVerification.findUnique({
            where: { token },
            include: { user: true }
        });

        if (!verification) {
            return false;
        }

        if (verification.expiresAt < new Date()) {
            // Expired
            return false;
        }

        // Mark user as verified
        await this.prisma.user.update({
            where: { id: verification.userId },
            data: { isEmailVerified: true }
        });

        // Delete successful token
        await this.prisma.emailVerification.delete({
            where: { id: verification.id }
        });

        return true;
    }
}
