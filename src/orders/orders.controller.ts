import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe
} from '@nestjs/common'
import { UserAccessJwtAuthGuard } from '../auth/guards/user-access-jwt-auth.guard'
import { OrdersService } from './orders.service'
import { CreateOrderRequestDto } from './dtos/create-order-request.dto'
import { AuthenticatedEntity } from '../auth/decorators/authenticated-entity.decorator'
import { User } from '../users/entities/user.entity'
import { UserOrderResponseDto } from './dtos/user-order-response.dto'
import { RestaurantOrderResponseDto } from './dtos/restaurant-order-response.dto'
import { AcceptOrderRequestDto } from './dtos/accept-order-request.dto'

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get(':id/user')
  @UseGuards(UserAccessJwtAuthGuard)
  getUserOrder(
    @Param('id', ParseIntPipe) id: number,
    @AuthenticatedEntity() user: User
  ): Promise<UserOrderResponseDto> {
    return this.ordersService.getUserOrder(id, user)
  }

  @Get('user')
  @UseGuards(UserAccessJwtAuthGuard)
  getUserOrders(
    @AuthenticatedEntity() user: User
  ): Promise<UserOrderResponseDto[]> {
    return this.ordersService.getUserOrders(user)
  }

  @Get(':id/restaurant')
  @UseGuards(UserAccessJwtAuthGuard)
  getRestaurantOrder(
    @Param('id', ParseIntPipe) id: number,
    @AuthenticatedEntity() employee: User
  ): Promise<RestaurantOrderResponseDto> {
    return this.ordersService.getRestaurantOrder(id, employee)
  }

  @Get('restaurant')
  @UseGuards(UserAccessJwtAuthGuard)
  getRestaurantOrders(
    @AuthenticatedEntity() employee: User
  ): Promise<RestaurantOrderResponseDto[]> {
    return this.ordersService.getRestaurantOrders(employee)
  }

  @Post('create')
  @UseGuards(UserAccessJwtAuthGuard)
  @UsePipes(ValidationPipe)
  createOrder(
    @Body() createOrderRequestDto: CreateOrderRequestDto,
    @AuthenticatedEntity() user: User
  ): Promise<void> {
    return this.ordersService.createOrder(createOrderRequestDto, user)
  }

  @Post('accept')
  @UseGuards(UserAccessJwtAuthGuard)
  @UsePipes(ValidationPipe)
  acceptOrder(
    @Body() acceptOrderRequestDto: AcceptOrderRequestDto,
    @AuthenticatedEntity() employee: User
  ): Promise<void> {
    return this.ordersService.acceptOrder(acceptOrderRequestDto, employee)
  }
}
