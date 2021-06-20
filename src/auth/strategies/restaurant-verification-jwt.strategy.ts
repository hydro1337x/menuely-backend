import { Inject, Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { StrategyType } from '../enums/strategy-type.enum'
import authConfig from '../config/auth.config'
import { ConfigType } from '@nestjs/config'
import { JwtPayload } from '../interfaces/jwt-payload.interface'
import { RestaurantsService } from '../../restaurants/restaurants.service'
import { Restaurant } from '../../restaurants/entities/restaurant.entity'

@Injectable()
export class RestaurantVerificationJwtStrategy extends PassportStrategy(
  Strategy,
  StrategyType.RESTAURANT_VERIFICATION_JWT
) {
  constructor(
    private readonly restaurantsService: RestaurantsService,
    @Inject(authConfig.KEY)
    private readonly authConfiguration: ConfigType<typeof authConfig>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromUrlQueryParameter('token'),
      secretOrKey: authConfiguration.verificationTokenSecret
    })
  }

  async validate(payload: JwtPayload): Promise<Restaurant> {
    const { id } = payload
    const restaurant = await this.restaurantsService.findRestaurant({ id })

    return restaurant
  }
}
