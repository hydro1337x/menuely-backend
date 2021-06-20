import { Inject, Injectable } from '@nestjs/common'
import { UsersService } from '../../users/users.service'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { ConfigType } from '@nestjs/config'
import { User } from '../../users/entities/user.entity'
import { JwtPayload } from '../../tokens/interfaces/jwt-payload.interface'
import { StrategyType } from '../enums/strategy-type.enum'
import tokensConfig from '../../tokens/config/tokens.config'

@Injectable()
export class UserAccessJwtStrategy extends PassportStrategy(
  Strategy,
  StrategyType.USER_ACCESS_JWT
) {
  constructor(
    private usersService: UsersService,
    @Inject(tokensConfig.KEY)
    private readonly tokensConfiguration: ConfigType<typeof tokensConfig>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: tokensConfiguration.accessTokenSecret
    })
  }

  async validate(payload: JwtPayload): Promise<User> {
    const { id } = payload
    const user = await this.usersService.findUser({ id })

    return user
  }
}
