import { IsString, IsOptional, IsInt, IsNotEmpty } from 'class-validator';

export class CreateCategoryDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    slug: string;

    @IsInt()
    @IsOptional()
    parentId?: number;
}
