import {
  createParamDecorator,
  ExecutionContext,
  NotFoundException
} from '@nestjs/common'
import { User } from '../../users/entities/user.entity'

export const AuthenticatedEntity = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): any => {
    const request = ctx.switchToHttp().getRequest()

    const entity = request.user

    if (!entity) {
      throw new NotFoundException('Authenticated entity not found')
    }

    return entity
  }
)
