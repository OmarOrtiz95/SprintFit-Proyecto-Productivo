import { Module } from '@nestjs/common';
import { CategoriesService } from './categories/categories.service';
import { CategoriesController } from './categories/categories.controller';
import { ProductsService } from './products/products.service';
import { ProductsController } from './products/products.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [CategoriesController, ProductsController],
    providers: [CategoriesService, ProductsService],
    exports: [CategoriesService, ProductsService],
})
export class CatalogsModule { }
