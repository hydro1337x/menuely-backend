import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { StrategyType } from '../enums/strategy-type.enum'

@Injectable()
export class RestaurantLocalAuthGuard extends AuthGuard(
  StrategyType.RESTAURANT_LOCAL
) {}
