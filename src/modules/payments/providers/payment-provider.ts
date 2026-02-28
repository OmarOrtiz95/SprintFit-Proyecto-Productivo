export interface PaymentResponse {
    success: boolean;
    transactionReference: string;
    providerResponse: any;
    status: 'APPROVED' | 'DECLINED' | 'ERROR' | 'PENDING';
}

export abstract class PaymentProvider {
    abstract processPayment(orderId: number, amount: number, cardDetails?: any): Promise<PaymentResponse>;
    abstract verifyWebhook(payload: any): Promise<PaymentResponse>;
}
