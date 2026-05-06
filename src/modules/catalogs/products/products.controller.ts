import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Role } from '@prisma/client';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../../../common/config/multer.config';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiBearerAuth()
    @Roles(Role.ADMIN)
    @UseInterceptors(FilesInterceptor('images', 20, multerConfig))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Create a new product (Admin only)' })
    create(
        @Body() createProductDto: CreateProductDto,
        @UploadedFiles() files: Express.Multer.File[]
    ) {
        return this.productsService.create(createProductDto, files);
    }

    @Get()
    @ApiOperation({ summary: 'Get all products' })
    findAll() {
        return this.productsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a product by ID' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiBearerAuth()
    @Roles(Role.ADMIN)
    @UseInterceptors(FilesInterceptor('images', 20, multerConfig))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Update a product (Admin only)' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateProductDto: UpdateProductDto,
        @UploadedFiles() files: Express.Multer.File[]
    ) {
        return this.productsService.update(id, updateProductDto, files);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiBearerAuth()
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Delete a product (Admin only)' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.remove(id);
    }
}
