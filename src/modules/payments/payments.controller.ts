import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreatePaymentDto } from './dto/create-payment.dto';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post('process')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Process a payment for an order' })
    createPayment(@Body() createPaymentDto: CreatePaymentDto) {
        return this.paymentsService.createPayment(
            createPaymentDto.orderId,
            createPaymentDto.cardDetails
        );
    }

    @Post('webhook')
    @ApiOperation({ summary: 'Payment provider webhook' })
    webhook(@Body() payload: any) {
        return this.paymentsService.handleWebhook(payload);
    }
}
