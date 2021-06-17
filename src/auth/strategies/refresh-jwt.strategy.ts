import { Inject, Injectable, Req } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { StrategyType } from '../enums/strategy-type.enum'
import { ConfigType } from '@nestjs/config'
import { JwtPayload } from '../interfaces/jwt-payload.interface'
import { User } from '../../users/entities/user.entity'
import authConfig from '../config/auth.config'
import { AuthService } from '../auth.service'
import { Restaurant } from '../../restaurants/entities/restaurant.entity'
import { log } from 'util'

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  StrategyType.REFRESH_JWT
) {
  constructor(
    private authService: AuthService,
    @Inject(authConfig.KEY)
    private readonly authConfiguration: ConfigType<typeof authConfig>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      secretOrKey: authConfiguration.refreshTokenSecret,
      passReqToCallback: true
    })
  }

  async validate(
    @Req() request,
    payload: JwtPayload
  ): Promise<User | Restaurant> {
    const { refreshToken } = request.body
    const { id } = payload

    const userTokenTouple = await this.authService.validateUserRefreshToken(
      refreshToken,
      id
    )

    const restaurantTokenTouple =
      await this.authService.validateRestaurantRefreshToken(refreshToken, id)

    request.refreshToken = userTokenTouple
      ? userTokenTouple.token
      : restaurantTokenTouple.token

    return userTokenTouple
      ? userTokenTouple.entity
      : restaurantTokenTouple.entity
  }
}
