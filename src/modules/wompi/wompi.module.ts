import { Module } from '@nestjs/common';
import { WompiService } from './wompi.service';
import { WompiController } from './wompi.controller';
import { DatabaseModule } from '../../database/database.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
    imports: [DatabaseModule, OrdersModule],
    providers: [WompiService],
    controllers: [WompiController],
    exports: [WompiService]
})
export class WompiModule {}
