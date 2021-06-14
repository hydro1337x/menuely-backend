import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { ConfigService } from '@nestjs/config'
import { JwtPayload } from '../interfaces/jwt-payload.interface'
import { StrategyType } from '../enums/strategy-type.enum'
import { RestaurantsService } from '../../restaurants/restaurants.service'
import { Restaurant } from '../../restaurants/entities/restaurant.entity'

@Injectable()
export class RestaurantJwtStrategy extends PassportStrategy(
  Strategy,
  StrategyType.RESTAURANT_JWT
) {
  constructor(
    private restaurantsService: RestaurantsService,
    private configService: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('APP_SECRET')
    })
  }

  async validate(payload: JwtPayload): Promise<Restaurant> {
    const { email } = payload
    const restaurant = await this.restaurantsService.findRestaurant(email)

    if (!restaurant) {
      throw new UnauthorizedException()
    }

    return restaurant
  }
}
