import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { ConfigType } from '@nestjs/config'
import { JwtPayload } from '../../tokens/interfaces/jwt-payload.interface'
import { StrategyType } from '../enums/strategy-type.enum'
import { RestaurantsService } from '../../restaurants/restaurants.service'
import { Restaurant } from '../../restaurants/entities/restaurant.entity'
import tokensConfig from '../../tokens/config/tokens.config'

@Injectable()
export class RestaurantAccessJwtStrategy extends PassportStrategy(
  Strategy,
  StrategyType.RESTAURANT_ACCESS_JWT
) {
  constructor(
    private restaurantsService: RestaurantsService,
    @Inject(tokensConfig.KEY)
    private readonly tokensConfiguration: ConfigType<typeof tokensConfig>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: tokensConfiguration.accessTokenSecret
    })
  }

  async validate(payload: JwtPayload): Promise<Restaurant> {
    const { id } = payload
    const restaurant = await this.restaurantsService.findRestaurant({ id })

    return restaurant
  }
}
