import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PaymentProvider } from './providers/payment-provider';
import { OrdersService } from '../orders/orders.service';
import { PaymentStatus, OrderStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
    constructor(
        private prisma: PrismaService,
        private ordersService: OrdersService,
        private paymentProvider: PaymentProvider,
    ) { }

    async createPayment(orderId: number, cardDetails?: any) {
        const order = await this.ordersService.findOne(orderId);

        if (order.status !== OrderStatus.PENDING_PAYMENT) {
            throw new BadRequestException('Order is not in PENDING_PAYMENT status');
        }

        const response = await this.paymentProvider.processPayment(
            order.id,
            Number(order.totalAmount),
            cardDetails
        );

        // Save payment record
        const payment = await this.prisma.payment.create({
            data: {
                orderId: order.id,
                amount: order.totalAmount,
                status: response.status as PaymentStatus,
                transactionReference: response.transactionReference,
                providerResponse: response.providerResponse,
            },
        });

        // Update order status if approved
        if (response.status === 'APPROVED') {
            await this.ordersService.updateStatus(order.id, OrderStatus.PAID);
        }

        return payment;
    }

    async handleWebhook(payload: any) {
        const response = await this.paymentProvider.verifyWebhook(payload);

        const payment = await this.prisma.payment.findUnique({
            where: { transactionReference: response.transactionReference }
        });

        if (!payment) {
            throw new NotFoundException('Payment record not found');
        }

        await this.prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: response.status as PaymentStatus,
                providerResponse: response.providerResponse
            }
        });

        if (response.status === 'APPROVED') {
            await this.ordersService.updateStatus(payment.orderId, OrderStatus.PAID);
        }

        return { received: true };
    }
}
