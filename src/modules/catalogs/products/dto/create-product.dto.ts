import { IsString, IsNotEmpty, IsNumber, IsOptional, IsInt, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CreateProductImageDto {
    @IsString()
    @IsNotEmpty()
    url: string;

    @IsInt()
    @IsOptional()
    displayOrder?: number;
}

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsNotEmpty()
    sku: string;

    @IsNumber()
    @IsNotEmpty()
    price: number;

    @IsInt()
    @IsOptional()
    stockQuantity?: number;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @IsOptional()
    attributes?: any;

    @IsInt()
    @IsNotEmpty()
    categoryId: number;

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => CreateProductImageDto)
    images?: CreateProductImageDto[];
}
