import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { ConfigType } from '@nestjs/config'
import { JwtPayload } from '../interfaces/jwt-payload.interface'
import { StrategyType } from '../enums/strategy-type.enum'
import { RestaurantsService } from '../../restaurants/restaurants.service'
import { Restaurant } from '../../restaurants/entities/restaurant.entity'
import authConfig from '../config/auth.config'

@Injectable()
export class RestaurantAccessJwtStrategy extends PassportStrategy(
  Strategy,
  StrategyType.RESTAURANT_ACCESS_JWT
) {
  constructor(
    private restaurantsService: RestaurantsService,
    @Inject(authConfig.KEY)
    private readonly authConfiguration: ConfigType<typeof authConfig>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: authConfiguration.accessTokenSecret
    })
  }

  async validate(payload: JwtPayload): Promise<Restaurant> {
    const { id } = payload
    const restaurant = await this.restaurantsService.findRestaurant({ id })

    return restaurant
  }
}
