import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { OrdersModule } from '../orders/orders.module';
import { DatabaseModule } from '../../database/database.module';
import { PaymentProvider } from './providers/payment-provider';
import { MockPaymentProvider } from './providers/mock-payment.provider';
import { WompiPaymentProvider } from './providers/wompi-payment.provider';
import { ConfigService } from '@nestjs/config';

@Module({
    imports: [DatabaseModule, OrdersModule],
    controllers: [PaymentsController],
    providers: [
        PaymentsService,
        {
            provide: PaymentProvider,
            useFactory: (configService: ConfigService) => {
                const useMock = configService.get('USE_MOCK_PAYMENT') === 'true';
                return useMock ? new MockPaymentProvider() : new WompiPaymentProvider();
            },
            inject: [ConfigService],
        },
    ],
    exports: [PaymentsService],
})
export class PaymentsModule { }
