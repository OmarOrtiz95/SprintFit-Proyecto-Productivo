import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
    constructor(private prisma: PrismaService) { }

    async create(userId: number, createOrderDto: CreateOrderDto) {
        const { items, shippingAddress, phone } = createOrderDto;

        // 1. Get products to verify stock and prices
        const productIds = items.map(item => item.productId);
        const products = await this.prisma.product.findMany({
            where: { id: { in: productIds } },
        });

        if (products.length !== items.length) {
            throw new NotFoundException('Some products were not found');
        }

        // 2. Calculate total and check stock
        let totalAmount = 0;
        const orderItemsData = [];

        for (const item of items) {
            const product = products.find(p => p.id === item.productId);

            if (product.stockQuantity < item.quantity) {
                throw new BadRequestException(`Not enough stock for product: ${product.name}`);
            }

            const itemTotal = Number(product.price) * item.quantity;
            totalAmount += itemTotal;

            orderItemsData.push({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: product.price,
            });
        }

        // 3. Create order and update stock in a transaction
        return this.prisma.$transaction(async (tx) => {
            // Create Order
            const order = await tx.order.create({
                data: {
                    userId,
                    shippingAddress,
                    phone,
                    totalAmount,
                    status: OrderStatus.PENDING_PAYMENT,
                    items: {
                        create: orderItemsData,
                    },
                },
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                },
            });

            // Update Stock
            for (const item of items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stockQuantity: {
                            decrement: item.quantity,
                        },
                    },
                });
            }

            return order;
        });
    }

    async findAll() {
        return this.prisma.order.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        fullName: true,
                    },
                },
                items: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findByUser(userId: number) {
        return this.prisma.order.findMany({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: number) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                user: true,
                items: {
                    include: {
                        product: true,
                    },
                },
                payments: true,
            },
        });

        if (!order) {
            throw new NotFoundException(`Order #${id} not found`);
        }

        return order;
    }

    async updateStatus(id: number, status: OrderStatus) {
        const order = await this.findOne(id);

        // Logic for returning stock if cancelled
        if (status === OrderStatus.CANCELLED && order.status !== OrderStatus.CANCELLED) {
            await this.prisma.$transaction(async (tx) => {
                for (const item of order.items) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: {
                            stockQuantity: {
                                increment: item.quantity,
                            },
                        },
                    });
                }
            });
        }

        return this.prisma.order.update({
            where: { id },
            data: { status },
        });
    }
}
