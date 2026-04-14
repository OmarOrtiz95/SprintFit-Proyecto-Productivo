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

    async getAddresses(userId: number) {
        return this.prisma.shippingAddress.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }

    async addAddress(userId: number, data: any) {
        if (data.isDefault) {
            await this.prisma.shippingAddress.updateMany({
                where: { userId },
                data: { isDefault: false }
            });
        }
        return this.prisma.shippingAddress.create({
            data: {
                userId,
                ...data
            }
        });
    }

    async updateAddress(userId: number, addressId: number, data: any) {
        if (data.isDefault) {
            await this.prisma.shippingAddress.updateMany({
                where: { userId },
                data: { isDefault: false }
            });
        }
        return this.prisma.shippingAddress.update({
            where: { id: addressId, userId },
            data
        });
    }

    async deleteAddress(userId: number, addressId: number) {
        return this.prisma.shippingAddress.delete({
            where: { id: addressId, userId }
        });
    }

    async updateProfile(userId: number, data: { fullName?: string; phone?: string; email?: string }) {
        if (data.email) {
            const existing = await this.findOne(data.email);
            if (existing && existing.id !== userId) {
                throw new ConflictException('Email already exists');
            }
        }
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data
        });
        const { passwordHash, ...safeUser } = updated;
        return safeUser;
    }

    async changePassword(userId: number, newPassword: string) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash: hashedPassword }
        });
        const { passwordHash, ...safeUser } = updated;
        return safeUser;
    }
}
