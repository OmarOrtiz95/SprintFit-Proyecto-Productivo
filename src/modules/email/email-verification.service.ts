import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class EmailVerificationService {
  constructor(private prisma: PrismaService) {}

  async createToken(userId: number): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');

    await this.prisma.emailVerification.create({
      data: {
        userId,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    return token;
  }

  async verifyToken(token: string): Promise<{ userId: number } | null> {
    const verification = await this.prisma.emailVerification.findUnique({
      where: { token },
    });

    if (!verification || verification.expiresAt < new Date()) {
      return null;
    }

    await this.prisma.user.update({
      where: { id: verification.userId },
      data: { isEmailVerified: true },
    });

    await this.prisma.emailVerification.delete({
      where: { id: verification.id },
    });

    return { userId: verification.userId };
  }
}
