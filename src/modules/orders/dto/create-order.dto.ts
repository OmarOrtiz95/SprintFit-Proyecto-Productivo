import { IsString, IsNotEmpty, IsArray, ValidateNested, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class OrderItemDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    @IsNotEmpty()
    productId: number;

    @ApiProperty({ example: 2 })
    @IsInt()
    @Min(1)
    @IsNotEmpty()
    quantity: number;
}

export class CreateOrderDto {
    @ApiProperty({ example: 'Calle 123 #45-67, Bogotá' })
    @IsString()
    @IsNotEmpty()
    shippingAddress: string;

    @ApiProperty({ example: '3001234567', required: false })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiProperty({ type: [OrderItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];
}
