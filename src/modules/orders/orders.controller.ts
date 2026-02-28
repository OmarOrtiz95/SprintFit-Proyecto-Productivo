import { Controller, Get, Post, Body, Patch, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus, Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('orders')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    @Roles(Role.CUSTOMER, Role.ADMIN)
    create(@Request() req, @Body() createOrderDto: CreateOrderDto) {
        return this.ordersService.create(req.user.id, createOrderDto);
    }

    @Get()
    @Roles(Role.ADMIN)
    findAll() {
        return this.ordersService.findAll();
    }

    @Get('my-orders')
    @Roles(Role.CUSTOMER, Role.ADMIN)
    findMyOrders(@Request() req) {
        return this.ordersService.findByUser(req.user.id);
    }

    @Get(':id')
    @Roles(Role.CUSTOMER, Role.ADMIN)
    async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
        const order = await this.ordersService.findOne(id);

        // Check if customer is looking at their own order
        if (req.user.role === Role.CUSTOMER && order.userId !== req.user.id) {
            throw new Error('Forbidden resource'); // Simple error, can improve to ForbiddenException
        }

        return order;
    }

    @Patch(':id/status')
    @Roles(Role.ADMIN)
    updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body('status') status: OrderStatus,
    ) {
        return this.ordersService.updateStatus(id, status);
    }
}
