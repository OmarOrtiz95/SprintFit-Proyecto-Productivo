import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) { }

    async create(createCategoryDto: CreateCategoryDto) {
        const existing = await this.prisma.category.findUnique({
            where: { slug: createCategoryDto.slug },
        });

        if (existing) {
            throw new ConflictException(`Category with slug ${createCategoryDto.slug} already exists`);
        }

        return this.prisma.category.create({
            data: {
                name: createCategoryDto.name,
                slug: createCategoryDto.slug,
                parentId: createCategoryDto.parentId,
            },
        });
    }

    async findAll() {
        return this.prisma.category.findMany({
            include: {
                children: true,
            },
        });
    }

    async findOne(id: number) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: {
                children: true,
                parent: true,
            },
        });

        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }

        return category;
    }

    async update(id: number, updateCategoryDto: UpdateCategoryDto) {
        await this.findOne(id);

        if (updateCategoryDto.slug) {
            const existing = await this.prisma.category.findUnique({
                where: { slug: updateCategoryDto.slug },
            });
            if (existing && existing.id !== id) {
                throw new ConflictException(`Category with slug ${updateCategoryDto.slug} already exists`);
            }
        }

        return this.prisma.category.update({
            where: { id },
            data: updateCategoryDto,
        });
    }

    async remove(id: number) {
        await this.findOne(id);
        return this.prisma.category.delete({
            where: { id },
        });
    }
}
