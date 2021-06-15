import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { User } from '../../users/entities/user.entity'

export const AuthenticatedEntity = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): any => {
    const request = ctx.switchToHttp().getRequest()
    return request.user
  }
)
