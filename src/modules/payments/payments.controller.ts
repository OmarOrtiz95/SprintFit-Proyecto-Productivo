import { Controller, Post, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post('checkout/:orderId')
    @UseGuards(AuthGuard('jwt'))
    checkout(
        @Param('orderId', ParseIntPipe) orderId: number,
        @Body() cardDetails: any,
    ) {
        return this.paymentsService.createPayment(orderId, cardDetails);
    }

    @Post('webhook')
    webhook(@Body() payload: any) {
        return this.paymentsService.handleWebhook(payload);
    }
}
