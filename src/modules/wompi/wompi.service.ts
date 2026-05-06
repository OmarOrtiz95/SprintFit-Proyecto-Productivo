import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { CreateNequiTransactionDto } from './dto/create-nequi-transaction.dto';

import { PrismaService } from '../../database/prisma.service';
import { OrdersService } from '../orders/orders.service';
import { PaymentStatus, OrderStatus } from '@prisma/client';

@Injectable()
export class WompiService {
    private readonly apiUrl: string;
    private readonly publicKey: string;
    private readonly privateKey: string;
    private readonly integrityKey: string;
    private readonly eventsKey: string;

    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
    ) {
        this.apiUrl = 'https://sandbox.wompi.co/v1'; // Sandbox URL
        this.publicKey = this.configService.get<string>('WOMPI_PUBLIC_KEY') || '';
        this.privateKey = this.configService.get<string>('WOMPI_PRIVATE_KEY') || '';
        this.integrityKey = this.configService.get<string>('WOMPI_INTEGRITY_KEY') || '';
        this.eventsKey = this.configService.get<string>('WOMPI_EVENTS_KEY') || '';
    }

    generateIntegritySignature(reference: string, amountInCents: number, currency: string): string {
        const stringToHash = `${reference}${amountInCents}${currency}${this.integrityKey}`;
        return crypto.createHash('sha256').update(stringToHash).digest('hex');
    }

    async getAcceptanceToken(): Promise<string> {
        const response = await fetch(`${this.apiUrl}/merchants/${this.publicKey}`);
        if (!response.ok) {
            throw new InternalServerErrorException('Failed to fetch acceptance token from Wompi');
        }
        const json = await response.json();
        return json.data.presigned_acceptance.acceptance_token;
    }

    async createNequiTransaction(dto: CreateNequiTransactionDto) {
        const reference = `NEQUI_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
        const signature = this.generateIntegritySignature(reference, dto.amountInCents, 'COP');
        const acceptanceToken = await this.getAcceptanceToken();

        // Create Payment in database
        await this.prisma.payment.create({
            data: {
                orderId: dto.orderId,
                amount: dto.amountInCents / 100, // stored as standard COP, not cents
                status: PaymentStatus.PENDING,
                transactionReference: reference,
            }
        });

        const payload = {
            amount_in_cents: dto.amountInCents,
            currency: 'COP',
            customer_email: dto.customerEmail,
            reference: reference,
            signature: signature,
            acceptance_token: acceptanceToken,
            payment_method: {
                type: 'NEQUI',
                phone_number: dto.phoneNumber
            }
        };

        const response = await fetch(`${this.apiUrl}/transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.publicKey}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new InternalServerErrorException(error);
        }

        const json = await response.json();
        return json.data;
    }

    async getTransaction(transactionId: string) {
        const response = await fetch(`${this.apiUrl}/transactions/${transactionId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.publicKey}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new InternalServerErrorException(error);
        }

        const json = await response.json();
        
        // Sincronizar con la base de datos cada vez que se consulte (útil para el polling local o si el webhook falla)
        try {
            await this.processWebhook(json.data);
        } catch (err) {
            console.error('Error sincronizando DB durante getTransaction:', err);
        }
        
        return json.data;
    }

    async processWebhook(transaction: any) {
        console.log('[processWebhook] Called with:', JSON.stringify(transaction?.status), 'ref:', transaction?.reference);
        if (!transaction || !transaction.reference) return;

        const payment = await this.prisma.payment.findUnique({
            where: { transactionReference: transaction.reference }
        });

        console.log('[processWebhook] Payment found:', payment ? `id=${payment.id}, orderId=${payment.orderId}, status=${payment.status}` : 'NOT FOUND');
        if (!payment) return;

        let newStatus: PaymentStatus = PaymentStatus.PENDING;
        if (transaction.status === 'APPROVED') newStatus = PaymentStatus.APPROVED;
        if (transaction.status === 'DECLINED') newStatus = PaymentStatus.DECLINED;
        if (transaction.status === 'ERROR') newStatus = PaymentStatus.ERROR;
        if (transaction.status === 'VOIDED') newStatus = PaymentStatus.VOIDED;

        console.log('[processWebhook] Wompi status:', transaction.status, '-> DB status:', newStatus);

        await this.prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: newStatus,
                providerResponse: transaction
            }
        });
        console.log('[processWebhook] Payment updated successfully');

        if (newStatus === PaymentStatus.APPROVED) {
            console.log('[processWebhook] Updating order', payment.orderId, 'to PAID...');
            try {
                const updatedOrder = await this.prisma.order.update({
                    where: { id: payment.orderId },
                    data: { status: OrderStatus.PAID }
                });
                console.log('[processWebhook] Order updated:', updatedOrder.id, updatedOrder.status);
            } catch (orderErr) {
                console.error('[processWebhook] ERROR updating order:', orderErr);
            }
        } else {
            console.log('[processWebhook] Status is not APPROVED, skipping order update');
        }
    }
}
