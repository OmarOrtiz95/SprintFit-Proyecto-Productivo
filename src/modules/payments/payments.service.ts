import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PaymentProvider } from './providers/payment-provider';
import { OrdersService } from '../orders/orders.service';
import { PaymentStatus, OrderStatus } from '@prisma/client';

import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
    constructor(
        private prisma: PrismaService,
        private ordersService: OrdersService,
    ) { }

    async createWompiPayment(orderId: number) {
        const order = await this.ordersService.findOne(orderId);

        if (order.status !== OrderStatus.PENDING_PAYMENT) {
            throw new BadRequestException('Order is not in PENDING_PAYMENT status');
        }

        const transactionReference = `SPRINTFIT-${order.id}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        
        // Save initial payment record
        const payment = await this.prisma.payment.create({
            data: {
                orderId: order.id,
                amount: order.totalAmount,
                status: PaymentStatus.PENDING,
                transactionReference: transactionReference,
            },
        });

        const amountInCents = Math.round(Number(order.totalAmount) * 100);
        // Using a test public key per user instructions
        const publicKey = process.env.WOMPI_PUBLIC_KEY || 'pub_test_Q5yDA9xoKdePzhS8pG1ZAMiYn0R42bF9';

        return {
            paymentId: payment.id,
            transactionReference,
            amountInCents,
            currency: 'COP',
            publicKey,
            redirectUrl: 'http://localhost:5173/payment-result'
        };
    }

    async handleWebhook(payload: any) {
        // Wompi sends event updates
        const transaction = payload?.data?.transaction;
        if (!transaction) return { received: false };

        const payment = await this.prisma.payment.findUnique({
            where: { transactionReference: transaction.reference }
        });

        if (!payment) {
            throw new NotFoundException('Payment record not found');
        }

        let newStatus: PaymentStatus = PaymentStatus.PENDING;
        if (transaction.status === 'APPROVED') newStatus = PaymentStatus.APPROVED;
        if (transaction.status === 'DECLINED') newStatus = PaymentStatus.DECLINED;
        if (transaction.status === 'ERROR') newStatus = PaymentStatus.ERROR;
        if (transaction.status === 'VOIDED') newStatus = PaymentStatus.VOIDED;

        await this.prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: newStatus,
                providerResponse: transaction
            }
        });

        if (newStatus === PaymentStatus.APPROVED) {
            await this.ordersService.updateStatus(payment.orderId, OrderStatus.PAID);
        }

        return { received: true };
    }
}
