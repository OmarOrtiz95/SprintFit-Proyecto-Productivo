import { Controller, Get, Post, Patch, Delete, Param, ParseIntPipe, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';
import { CreateShippingAddressDto, UpdateShippingAddressDto } from './dto/shipping-address.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('addresses')
    @ApiOperation({ summary: 'Get user shipping addresses' })
    getAddresses(@Request() req: any) {
        return this.usersService.getAddresses(req.user.id);
    }

    @Post('addresses')
    @ApiOperation({ summary: 'Add a new shipping address' })
    @ApiBody({ type: CreateShippingAddressDto })
    addAddress(@Request() req: any, @Body() body: CreateShippingAddressDto) {
        return this.usersService.addAddress(req.user.id, body);
    }

    @Patch('addresses/:id')
    @ApiOperation({ summary: 'Update shipping address' })
    @ApiBody({ type: UpdateShippingAddressDto })
    updateAddress(@Request() req: any, @Param('id', ParseIntPipe) id: number, @Body() body: UpdateShippingAddressDto) {
        return this.usersService.updateAddress(req.user.id, id, body);
    }

    @Delete('addresses/:id')
    @ApiOperation({ summary: 'Delete a shipping address' })
    deleteAddress(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
        return this.usersService.deleteAddress(req.user.id, id);
    }

    @Patch('profile')
    @ApiOperation({ summary: 'Update profile information' })
    updateProfile(@Request() req: any, @Body() body: { fullName?: string; phone?: string; email?: string }) {
        return this.usersService.updateProfile(req.user.id, body);
    }

    @Patch('password')
    @ApiOperation({ summary: 'Change user password' })
    changePassword(@Request() req: any, @Body() body: { password: string }) {
        return this.usersService.changePassword(req.user.id, body.password);
    }
}
