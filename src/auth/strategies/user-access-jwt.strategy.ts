import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { UsersService } from '../../users/users.service'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { ConfigType } from '@nestjs/config'
import { User } from '../../users/entities/user.entity'
import { JwtPayload } from '../interfaces/jwt-payload.interface'
import { StrategyType } from '../enums/strategy-type.enum'
import authConfig from '../config/auth.config'

@Injectable()
export class UserAccessJwtStrategy extends PassportStrategy(
  Strategy,
  StrategyType.USER_ACCESS_JWT
) {
  constructor(
    private usersService: UsersService,
    @Inject(authConfig.KEY)
    private readonly authConfiguration: ConfigType<typeof authConfig>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: authConfiguration.accessTokenSecret
    })
  }

  async validate(payload: JwtPayload): Promise<User> {
    const { id } = payload
    const user = await this.usersService.findUser({ id })

    return user
  }
}
