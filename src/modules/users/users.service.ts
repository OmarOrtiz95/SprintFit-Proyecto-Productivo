import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { User, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findOne(email: string): Promise<User | null> {
        if (!email) return null;
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async findById(id: number): Promise<User | null> {
        if (!id) return null;
        return this.prisma.user.findUnique({
            where: { id },
        });
    }

    async create(data: { email: string; password: string; fullName: string; phone?: string; role?: any }): Promise<User> {
        const existingUser = await this.findOne(data.email);
        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userData } = data;

        return this.prisma.user.create({
            data: {
                ...userData,
                passwordHash: hashedPassword,
            },
        });
    }
}
