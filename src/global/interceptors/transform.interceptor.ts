import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export interface Response<T> {
  statusCode: number
  message: string
  data: T
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<Response<T>> {
    const response = context.switchToHttp().getResponse()
    const message = response.message
    const statusCode = response.statusCode
    return next.handle().pipe(
      map((data) => ({
        statusCode: statusCode,
        message: message,
        data: data
      }))
    )
  }
}
