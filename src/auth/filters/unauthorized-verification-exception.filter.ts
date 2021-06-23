import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  UnauthorizedException
} from '@nestjs/common'

@Catch(UnauthorizedException)
export class UnauthorizedVerificationExceptionFilter
  implements ExceptionFilter
{
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const status = exception.getStatus()

    response.status(status).render('error', { message: 'Unauthorized' })
  }
}
