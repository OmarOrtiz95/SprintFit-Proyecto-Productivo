import { IsString, IsOptional, IsNumber, IsInt, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductDto {
    @ApiProperty({ example: 'Nuevo nombre', required: false })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({ example: 'Nueva descripción', required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: 'SKU-001', required: false })
    @IsString()
    @IsOptional()
    sku?: string;

    @ApiProperty({ example: 50000, required: false })
    @Transform(({ value }) => Number(value))
    @IsNumber()
    @IsOptional()
    price?: number;

    @ApiProperty({ example: 50, required: false })
    @Transform(({ value }) => Number(value))
    @IsInt()
    @IsOptional()
    stockQuantity?: number;

    @ApiProperty({ example: true, required: false })
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @ApiProperty({ example: { size: 'L' }, required: false })
    @IsOptional()
    @Transform(({ value }) => typeof value === 'string' ? JSON.parse(value) : value)
    attributes?: any;

    @ApiProperty({ example: 1, required: false })
    @Transform(({ value }) => Number(value))
    @IsInt()
    @IsOptional()
    categoryId?: number;

    @ApiProperty({ example: '["/uploads/products/image1.jpg"]', required: false, description: 'JSON string of existing image URLs to keep' })
    @IsOptional()
    @IsString()
    existingImages?: string;
}
