import { IsString, IsNotEmpty, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
    @IsNotEmpty()
    productId: number;

    @IsNotEmpty()
    quantity: number;
}

export class CreateOrderDto {
    @IsString()
    @IsNotEmpty()
    shippingAddress: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];
}
