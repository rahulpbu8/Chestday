import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard, RolesGuard } from '../auth/guards/auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Request() req, @Body() orderData: any) {
    return this.ordersService.createOrder(req.user.id, orderData);
  }

  @Get()
  async findAll(@Request() req) {
    return this.ordersService.findAllByUserId(req.user.id);
  }

  @Get('admin/all')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  async findAllAdmin(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search: string = ''
  ) {
    return this.ordersService.findAllOrdersAdmin(+page, +limit, search);
  }

  @Get('admin/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  async findOneAdmin(@Param('id') id: string) {
    return this.ordersService.findOneOrderAdmin(id);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.ordersService.findOne(id, req.user.id);
  }
}
