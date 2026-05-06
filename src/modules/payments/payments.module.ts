import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { OrdersModule } from '../orders/orders.module';
import { DatabaseModule } from '../../database/database.module';

@Module({
    imports: [DatabaseModule, OrdersModule],
    controllers: [],
    providers: [PaymentsService],
    exports: [PaymentsService],
})
export class PaymentsModule { }
