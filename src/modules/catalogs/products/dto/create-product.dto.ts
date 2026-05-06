import { IsString, IsNotEmpty, IsNumber, IsOptional, IsInt, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
    @ApiProperty({ example: 'Camiseta de Compresión' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'Camiseta de alta calidad para entrenamiento intenso.' })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ example: 'COMP-001' })
    @IsString()
    @IsNotEmpty()
    sku: string;

    @ApiProperty({ example: 45000 })
    @Transform(({ value }) => Number(value))
    @IsNumber()
    @IsNotEmpty()
    price: number;

    @ApiProperty({ example: 100, required: false })
    @Transform(({ value }) => Number(value))
    @IsInt()
    @IsOptional()
    stockQuantity?: number;

    @ApiProperty({ example: true, required: false })
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @ApiProperty({ example: { color: 'negro', talla: 'M' }, required: false })
    @IsOptional()
    @Transform(({ value }) => typeof value === 'string' ? JSON.parse(value) : value)
    attributes?: any;

    @ApiProperty({ example: 1 })
    @Transform(({ value }) => Number(value))
    @IsInt()
    @IsNotEmpty()
    categoryId: number;
}
