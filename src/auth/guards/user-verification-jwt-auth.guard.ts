import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { StrategyType } from '../enums/strategy-type.enum'

@Injectable()
export class UserVerificationJwtAuthGuard extends AuthGuard(
  StrategyType.USER_VERIFICATION_JWT
) {}
