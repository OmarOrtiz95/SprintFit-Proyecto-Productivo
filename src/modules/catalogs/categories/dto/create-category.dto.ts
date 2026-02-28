import { IsString, IsOptional, IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
    @ApiProperty({ example: 'Ropa Deportiva' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'ropa-deportiva' })
    @IsString()
    @IsNotEmpty()
    slug: string;

    @ApiProperty({ example: 1, required: false })
    @IsInt()
    @IsOptional()
    parentId?: number;
}
