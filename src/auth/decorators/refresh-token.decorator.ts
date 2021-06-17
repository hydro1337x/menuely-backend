import {
  createParamDecorator,
  ExecutionContext,
  NotFoundException
} from '@nestjs/common'

export const RefreshToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): any => {
    const request = ctx.switchToHttp().getRequest()

    const refreshToken = request.refreshToken
    if (!refreshToken) {
      throw new NotFoundException(
        'Refresh token is not contained inside request'
      )
    }

    return refreshToken
  }
)
