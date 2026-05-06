import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) { }

    private deleteFile(url: string) {
        if (!url || url.startsWith('http')) return; // Don't delete external URLs
        const filePath = join(process.cwd(), url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }

    async create(createProductDto: CreateProductDto, files: Express.Multer.File[]) {
        const productData = createProductDto;

        const existing = await this.prisma.product.findUnique({
            where: { sku: productData.sku },
        });

        if (existing) {
            // Delete uploaded files if creation fails
            files.forEach(file => this.deleteFile(join('uploads/products', file.filename)));
            throw new ConflictException(`Product with SKU ${productData.sku} already exists`);
        }

        const images = files.map((file, index) => ({
            url: `/uploads/products/${file.filename}`,
            displayOrder: index,
        }));

        const product = await this.prisma.product.create({
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

        return {
            ...product,
            price: Number(product.price)
        };
    }

    async findAll() {
        const products = await this.prisma.product.findMany({
            include: {
                images: true,
                category: true,
            },
        });

        return products.map(p => ({
            ...p,
            price: Number(p.price)
        }));
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

        return {
            ...product,
            price: Number(product.price)
        };
    }

    async update(id: number, updateProductDto: UpdateProductDto, files: Express.Multer.File[]) {
        const { existingImages, ...productData } = updateProductDto;
        const parsedExistingImages: string[] = existingImages ? JSON.parse(existingImages) : [];

        const currentProduct = await this.findOne(id);

        if (productData.sku) {
            const existing = await this.prisma.product.findUnique({
                where: { sku: productData.sku },
            });
            if (existing && existing.id !== id) {
                // Delete uploaded files if update fails
                files.forEach(file => this.deleteFile(join('uploads/products', file.filename)));
                throw new ConflictException(`Product with SKU ${productData.sku} already exists`);
            }
        }

        // Determine which images to delete
        const imagesToDelete = currentProduct.images.filter(
            img => !parsedExistingImages.includes(img.url)
        );

        // Delete files from disk
        imagesToDelete.forEach(img => this.deleteFile(img.url));

        // Delete records from DB and add new ones
        const product = await this.prisma.product.update({
            where: { id },
            data: {
                ...productData,
                images: {
                    deleteMany: {
                        url: {
                            in: imagesToDelete.map(img => img.url),
                        },
                    },
                    create: files.map((file, index) => ({
                        url: `/uploads/products/${file.filename}`,
                        displayOrder: parsedExistingImages.length + index,
                    })),
                },
            },
            include: {
                images: true,
            },
        });

        return {
            ...product,
            price: Number(product.price)
        };
    }

    async remove(id: number) {
        const product = await this.findOne(id);

        // Delete all images from disk
        product.images.forEach(img => this.deleteFile(img.url));

        return this.prisma.product.delete({
            where: { id },
        });
    }
}
