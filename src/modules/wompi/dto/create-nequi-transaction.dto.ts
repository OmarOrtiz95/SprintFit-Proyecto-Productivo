import { IsEmail, IsInt, IsNotEmpty, IsString, Length, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNequiTransactionDto {
    @ApiProperty({ example: '3001234567', description: 'Nequi phone number (10 digits)' })
    @IsString()
    @IsNotEmpty()
    @Length(10, 10)
    phoneNumber: string;

    @ApiProperty({ example: 1000000, description: 'Amount in cents (e.g. 10000 COP = 1000000 cents)' })
    @IsInt()
    @Min(1)
    amountInCents: number;

    @ApiProperty({ example: 'customer@example.com', description: 'Customer email address' })
    @IsEmail()
    @IsNotEmpty()
    customerEmail: string;

    @ApiProperty({ example: 1, description: 'Order ID' })
    @IsInt()
    @Min(1)
    orderId: number;
}
