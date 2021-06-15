import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { StrategyType } from '../enums/strategy-type.enum'

@Injectable()
export class UserAccessJwtAuthGuard extends AuthGuard(
  StrategyType.USER_ACCESS_JWT
) {}
