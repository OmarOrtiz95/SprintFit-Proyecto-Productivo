import { PaymentProvider, PaymentResponse } from './payment-provider';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MockPaymentProvider extends PaymentProvider {
    async processPayment(orderId: number, amount: number, cardDetails?: any): Promise<PaymentResponse> {
        console.log(`Processing MOCK payment for order ${orderId} with amount ${amount}`);

        // Simulate successful payment
        return {
            success: true,
            transactionReference: `mock_ref_${Date.now()}`,
            status: 'APPROVED',
            providerResponse: { message: 'Mock payment success' },
        };
    }

    async verifyWebhook(payload: any): Promise<PaymentResponse> {
        return {
            success: true,
            transactionReference: payload.reference,
            status: 'APPROVED',
            providerResponse: payload,
        };
    }
}
