import { IsString, IsNotEmpty, IsNumber, IsOptional, IsInt, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class CreateProductImageDto {
    @ApiProperty({ example: 'https://example.com/product-image.jpg' })
    @IsString()
    @IsNotEmpty()
    url: string;

    @ApiProperty({ example: 0, required: false })
    @IsInt()
    @IsOptional()
    displayOrder?: number;
}

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
    @IsNumber()
    @IsNotEmpty()
    price: number;

    @ApiProperty({ example: 100, required: false })
    @IsInt()
    @IsOptional()
    stockQuantity?: number;

    @ApiProperty({ example: true, required: false })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @ApiProperty({ example: { color: 'negro', talla: 'M' }, required: false })
    @IsOptional()
    attributes?: any;

    @ApiProperty({ example: 1 })
    @IsInt()
    @IsNotEmpty()
    categoryId: number;

    @ApiProperty({ type: [CreateProductImageDto], required: false })
    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => CreateProductImageDto)
    images?: CreateProductImageDto[];
}
