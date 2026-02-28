import { PaymentProvider, PaymentResponse } from './payment-provider';
import { Injectable, NotImplementedException } from '@nestjs/common';

@Injectable()
export class WompiPaymentProvider extends PaymentProvider {
    async processPayment(orderId: number, amount: number, cardDetails?: any): Promise<PaymentResponse> {
        throw new NotImplementedException('Wompi integration not yet implemented');
    }

    async verifyWebhook(payload: any): Promise<PaymentResponse> {
        throw new NotImplementedException('Wompi webhook not yet implemented');
    }
}
