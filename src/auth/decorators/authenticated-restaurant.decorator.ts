import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Restaurant } from '../../restaurants/entities/restaurant.entity'

export const AuthenticatedRestaurant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Restaurant => {
    const request = ctx.switchToHttp().getRequest()
    // AuthGuards always return a user object inside request, therefore we can not implicitly say request.restaurant
    return request.user
  }
)
