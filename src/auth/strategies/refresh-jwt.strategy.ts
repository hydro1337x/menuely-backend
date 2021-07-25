import { Inject, Injectable, Req, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { StrategyType } from '../enums/strategy-type.enum'
import { ConfigType } from '@nestjs/config'
import { JwtPayload } from '../../tokens/interfaces/jwt-payload.interface'
import { User } from '../../users/entities/user.entity'
import tokensConfig from '../../tokens/config/tokens.config'
import { AuthService } from '../auth.service'
import { Restaurant } from '../../restaurants/entities/restaurant.entity'

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  StrategyType.REFRESH_JWT
) {
  constructor(
    private authService: AuthService,
    @Inject(tokensConfig.KEY)
    private readonly tokensConfiguration: ConfigType<typeof tokensConfig>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      secretOrKey: tokensConfiguration.refreshTokenSecret,
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

    if (!userTokenTouple?.token && !restaurantTokenTouple?.token) {
      throw new UnauthorizedException('Entity refresh token not found')
    }

    request.refreshToken = userTokenTouple
      ? userTokenTouple.token
      : restaurantTokenTouple.token

    return userTokenTouple
      ? userTokenTouple.entity
      : restaurantTokenTouple.entity
  }
}
