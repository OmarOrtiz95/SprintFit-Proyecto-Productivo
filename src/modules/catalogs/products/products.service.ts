import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) { }

    async create(createProductDto: CreateProductDto) {
        const { images, ...productData } = createProductDto;

        const existing = await this.prisma.product.findUnique({
            where: { sku: productData.sku },
        });

        if (existing) {
            throw new ConflictException(`Product with SKU ${productData.sku} already exists`);
        }

        return this.prisma.product.create({
            data: {
                ...productData,
                images: {
                    create: images,
                },
            },
            include: {
                images: true,
                category: true,
            },
        });
    }

    async findAll() {
        return this.prisma.product.findMany({
            include: {
                images: true,
                category: true,
            },
        });
    }

    async findOne(id: number) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: {
                images: true,
                category: true,
            },
        });

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        return product;
    }

    async update(id: number, updateProductDto: UpdateProductDto) {
        const { images, ...productData } = updateProductDto;

        await this.findOne(id);

        if (productData.sku) {
            const existing = await this.prisma.product.findUnique({
                where: { sku: productData.sku },
            });
            if (existing && existing.id !== id) {
                throw new ConflictException(`Product with SKU ${productData.sku} already exists`);
            }
        }

        return this.prisma.product.update({
            where: { id },
            data: {
                ...productData,
                images: images ? {
                    deleteMany: {},
                    create: images.map(img => ({
                        url: img.url,
                        displayOrder: img.displayOrder,
                    })),
                } : undefined,
            },
            include: {
                images: true,
            },
        });
    }

    async remove(id: number) {
        await this.findOne(id);
        return this.prisma.product.delete({
            where: { id },
        });
    }
}
