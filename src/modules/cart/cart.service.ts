import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CartService {
    constructor(private prisma: PrismaService) {}

    async getCart(userId: number) {
        let cart = await this.prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: { product: { include: { images: true } } }
                }
            }
        });

        if (!cart) {
            cart = await this.prisma.cart.create({
                data: { userId },
                include: { items: { include: { product: { include: { images: true } } } } }
            });
        }
        return cart;
    }

    async addItem(userId: number, productId: number, quantity: number, attributes?: any) {
        const cart = await this.getCart(userId);

        const existingItem = await this.prisma.cartItem.findFirst({
            where: { cartId: cart.id, productId, attributes: attributes ? { equals: attributes } : undefined }
        });

        if (existingItem) {
            return this.prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity }
            });
        }

        return this.prisma.cartItem.create({
            data: {
                cartId: cart.id,
                productId,
                quantity,
                attributes
            }
        });
    }

    async updateQuantity(userId: number, productId: number, quantity: number) {
        const cart = await this.getCart(userId);
        const item = await this.prisma.cartItem.findFirst({
            where: { cartId: cart.id, productId }
        });

        if (!item) throw new NotFoundException('Item not found in cart');

        if (quantity <= 0) {
            return this.prisma.cartItem.delete({ where: { id: item.id } });
        }

        return this.prisma.cartItem.update({
            where: { id: item.id },
            data: { quantity }
        });
    }

    async removeItem(userId: number, productId: number) {
        const cart = await this.getCart(userId);
        const item = await this.prisma.cartItem.findFirst({
            where: { cartId: cart.id, productId }
        });
        
        if (item) {
            await this.prisma.cartItem.delete({ where: { id: item.id } });
        }
    }

    async clearCart(userId: number) {
        const cart = await this.getCart(userId);
        await this.prisma.cartItem.deleteMany({
            where: { cartId: cart.id }
        });
    }
}
