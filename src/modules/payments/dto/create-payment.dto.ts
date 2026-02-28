import { IsNotEmpty, IsInt, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    @IsNotEmpty()
    orderId: number;

    @ApiProperty({
        example: {
            number: '4242424242424242',
            cvc: '123',
            exp_month: '12',
            exp_year: '25'
        },
        required: false
    })
    @IsObject()
    @IsOptional()
    cardDetails?: any;
}
