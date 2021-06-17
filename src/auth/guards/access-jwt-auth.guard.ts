import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { StrategyType } from '../enums/strategy-type.enum'

@Injectable()
export class AccessJwtAuthGuard extends AuthGuard([
  StrategyType.USER_ACCESS_JWT,
  StrategyType.RESTAURANT_ACCESS_JWT
]) {}
