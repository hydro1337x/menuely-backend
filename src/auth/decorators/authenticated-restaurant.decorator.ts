import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Restaurant } from '../../restaurants/entities/restaurant.entity'

export const AuthenticatedRestaurant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Restaurant => {
    const request = ctx.switchToHttp().getRequest()
    return request.user
  }
)
