import { IsNotEmpty, IsInt, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    @IsNotEmpty()
    orderId: number;
}
