import {
  Body,
  Controller,
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

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}
  @Post('create')
  @UseGuards(UserAccessJwtAuthGuard)
  @UsePipes(ValidationPipe)
  createOrder(
    @Body() createOrderRequestDto: CreateOrderRequestDto,
    @AuthenticatedEntity() user: User
  ): Promise<void> {
    return this.ordersService.createOrder(createOrderRequestDto, user)
  }
}
