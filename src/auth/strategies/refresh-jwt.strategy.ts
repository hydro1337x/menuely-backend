import { ForbiddenException, Inject, Injectable, Req } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { StrategyType } from '../enums/strategy-type.enum'
import { ConfigType } from '@nestjs/config'
import { JwtPayload } from '../interfaces/jwt-payload.interface'
import { User } from '../../users/entities/user.entity'
import authConfig from '../config/auth.config'
import { AuthService } from '../auth.service'
import { Restaurant } from '../../restaurants/entities/restaurant.entity'

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
    const { email } = payload

    const user = await this.authService.validateUserRefreshToken(
      refreshToken,
      email
    )

    const restaurant = await this.authService.validateRestaurantRefreshToken(
      refreshToken,
      email
    )

    if (!user && !restaurant) {
      throw new ForbiddenException('Entity with given Refresh Token not found')
    }

    return user || restaurant
  }
}
