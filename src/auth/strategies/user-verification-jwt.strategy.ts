import { Inject, Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { StrategyType } from '../enums/strategy-type.enum'
import { UsersService } from '../../users/users.service'
import tokensConfig from '../../tokens/config/tokens.config'
import { ConfigType } from '@nestjs/config'
import { JwtPayload } from '../../tokens/interfaces/jwt-payload.interface'
import { User } from '../../users/entities/user.entity'

@Injectable()
export class UserVerificationJwtStrategy extends PassportStrategy(
  Strategy,
  StrategyType.USER_VERIFICATION_JWT
) {
  constructor(
    private readonly usersService: UsersService,
    @Inject(tokensConfig.KEY)
    private readonly tokensConfiguration: ConfigType<typeof tokensConfig>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromUrlQueryParameter('token'),
      secretOrKey: tokensConfiguration.verificationTokenSecret
    })
  }

  async validate(payload: JwtPayload): Promise<User> {
    const { id } = payload
    const user = await this.usersService.findUser({ id })

    return user
  }
}
