import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrderService, CreateOrderRequest } from './order.service';
import { Order, OrderStatus } from './schemas/order.schema';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserDocument, UserRole } from '../user/schemas/user.schema';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  async createOrder(
    @Body() request: CreateOrderRequest,
    @CurrentUser() user: UserDocument,
  ): Promise<Order> {
    return this.orderService.createOrder(request, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get user orders' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  async getUserOrders(@CurrentUser() user: UserDocument): Promise<Order[]> {
    return this.orderService.findUserOrders(user);
  }

  @Get('statistics')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get order statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStatistics(): Promise<any> {
    return this.orderService.getOrderStatistics();
  }

  @Get(':orderId')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrder(
    @Param('orderId') orderId: string,
    @CurrentUser() user: UserDocument,
  ): Promise<Order> {
    return this.orderService.findById(orderId, user);
  }

  @Put(':orderId/cancel')
  @ApiOperation({ summary: 'Cancel order' })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
  async cancelOrder(
    @Param('orderId') orderId: string,
    @Body('reason') reason: string,
    @CurrentUser() user: UserDocument,
  ): Promise<Order> {
    return this.orderService.cancelOrder(orderId, user, reason);
  }

  @Put(':orderId/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update order status (Admin only)' })
  @ApiResponse({ status: 200, description: 'Order status updated successfully' })
  async updateStatus(
    @Param('orderId') orderId: string,
    @Body('status') status: OrderStatus,
    @Body('note') note?: string,
  ): Promise<Order> {
    return this.orderService.updateOrderStatus(orderId, status, note, 'admin');
  }

  @Put(':orderId/tracking')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Add tracking information (Admin only)' })
  @ApiResponse({ status: 200, description: 'Tracking information added successfully' })
  async addTracking(
    @Param('orderId') orderId: string,
    @Body() trackingInfo: {
      carrier: string;
      trackingNumber: string;
      trackingUrl?: string;
      estimatedDelivery?: Date;
    },
  ): Promise<Order> {
    return this.orderService.addTrackingInfo(orderId, trackingInfo);
  }
}
