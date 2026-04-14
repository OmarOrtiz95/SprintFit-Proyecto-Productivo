import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { CartService } from './cart.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('cart')
export class CartController {
    constructor(private readonly cartService: CartService) {}

    @Get()
    @ApiOperation({ summary: 'Get user cart' })
    getCart(@Request() req: any) {
        return this.cartService.getCart(req.user.id);
    }

    @Post('items')
    @ApiOperation({ summary: 'Add item to cart' })
    addItem(@Request() req: any, @Body() body: { productId: number; quantity: number; attributes?: any }) {
        return this.cartService.addItem(req.user.id, body.productId, body.quantity, body.attributes);
    }

    @Put('items/:productId')
    @ApiOperation({ summary: 'Update item quantity' })
    updateItemQuantity(@Request() req: any, @Param('productId', ParseIntPipe) productId: number, @Body() body: { quantity: number }) {
        return this.cartService.updateQuantity(req.user.id, productId, body.quantity);
    }

    @Delete('items/:productId')
    @ApiOperation({ summary: 'Remove item from cart' })
    removeItem(@Request() req: any, @Param('productId', ParseIntPipe) productId: number) {
        return this.cartService.removeItem(req.user.id, productId);
    }

    @Delete()
    @ApiOperation({ summary: 'Clear cart' })
    clearCart(@Request() req: any) {
        return this.cartService.clearCart(req.user.id);
    }
}
