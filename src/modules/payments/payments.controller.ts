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
    @ApiOperation({ summary: 'Initiate a Wompi payment for an order' })
    createPayment(@Body() createPaymentDto: CreatePaymentDto) {
        return this.paymentsService.createWompiPayment(createPaymentDto.orderId);
    }

    @Post('webhook')
    @ApiOperation({ summary: 'Payment provider webhook' })
    webhook(@Body() payload: any) {
        return this.paymentsService.handleWebhook(payload);
    }
}
