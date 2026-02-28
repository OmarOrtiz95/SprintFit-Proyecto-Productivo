import { IsString, IsOptional, IsNumber, IsInt, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class UpdateProductImageDto {
    @IsInt()
    @IsOptional()
    id?: number;

    @IsString()
    @IsOptional()
    url?: string;

    @IsInt()
    @IsOptional()
    displayOrder?: number;
}

export class UpdateProductDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    sku?: string;

    @IsNumber()
    @IsOptional()
    price?: number;

    @IsInt()
    @IsOptional()
    stockQuantity?: number;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @IsOptional()
    attributes?: any;

    @IsInt()
    @IsOptional()
    categoryId?: number;

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => UpdateProductImageDto)
    images?: UpdateProductImageDto[];
}
