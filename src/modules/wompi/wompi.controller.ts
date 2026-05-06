import { Controller, Post, Get, Body, Param, Headers, BadRequestException } from '@nestjs/common';
import { WompiService } from './wompi.service';
import { CreateNequiTransactionDto } from './dto/create-nequi-transaction.dto';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Payments - Wompi')
@Controller('payments')
export class WompiController {
    constructor(
        private readonly wompiService: WompiService,
        private readonly configService: ConfigService
    ) {}

    @Post('nequi')
    @ApiOperation({ summary: 'Create Nequi transaction' })
    async createNequiTransaction(@Body() dto: CreateNequiTransactionDto) {
        const data = await this.wompiService.createNequiTransaction(dto);
        return {
            transactionId: data.id,
            status: data.status
        };
    }

    @Get(':transactionId')
    @ApiOperation({ summary: 'Get transaction status' })
    async getTransaction(@Param('transactionId') transactionId: string) {
        const data = await this.wompiService.getTransaction(transactionId);
        return {
            status: data.status
        };
    }

    @Post('webhook')
    @ApiOperation({ summary: 'Wompi Webhook' })
    async handleWebhook(@Body() payload: any, @Headers('x-event-checksum') headerChecksum: string) {
        const eventsKey = this.configService.get<string>('WOMPI_EVENTS_KEY') || '';
        
        if (!payload || !payload.signature || !payload.signature.properties) {
            throw new BadRequestException('Invalid payload');
        }

        const checksumToVerify = headerChecksum || payload.signature.checksum;

        const properties = payload.signature.properties;
        let stringToHash = '';
        for (const prop of properties) {
            // prop is like "transaction.id", "transaction.status", "transaction.amount_in_cents"
            const value = prop.split('.').reduce((o, i) => o ? o[i] : '', payload.data);
            stringToHash += value;
        }
        stringToHash += payload.timestamp;
        stringToHash += eventsKey;

        const expectedChecksum = crypto.createHash('sha256').update(stringToHash).digest('hex');

        if (expectedChecksum !== checksumToVerify) {
            throw new BadRequestException('Invalid checksum');
        }

        // Process the webhook payload and update DB
        await this.wompiService.processWebhook(payload.data.transaction);

        // Return 200 OK
        return { received: true };
    }
}
