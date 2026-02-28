import { IsString, IsOptional, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCategoryDto {
    @ApiProperty({ example: 'Nuevo Nombre', required: false })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({ example: 'nuevo-slug', required: false })
    @IsString()
    @IsOptional()
    slug?: string;

    @ApiProperty({ example: 1, required: false })
    @IsInt()
    @IsOptional()
    parentId?: number;
}
