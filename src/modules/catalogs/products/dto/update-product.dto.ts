import { IsString, IsOptional, IsNumber, IsInt, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class UpdateProductImageDto {
    @ApiProperty({ example: 1, required: false })
    @IsInt()
    @IsOptional()
    id?: number;

    @ApiProperty({ example: 'https://example.com/image.jpg', required: false })
    @IsString()
    @IsOptional()
    url?: string;

    @ApiProperty({ example: 0, required: false })
    @IsInt()
    @IsOptional()
    displayOrder?: number;
}

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
    @IsNumber()
    @IsOptional()
    price?: number;

    @ApiProperty({ example: 50, required: false })
    @IsInt()
    @IsOptional()
    stockQuantity?: number;

    @ApiProperty({ example: true, required: false })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @ApiProperty({ example: { size: 'L' }, required: false })
    @IsOptional()
    attributes?: any;

    @ApiProperty({ example: 1, required: false })
    @IsInt()
    @IsOptional()
    categoryId?: number;

    @ApiProperty({ type: [UpdateProductImageDto], required: false })
    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => UpdateProductImageDto)
    images?: UpdateProductImageDto[];
}
