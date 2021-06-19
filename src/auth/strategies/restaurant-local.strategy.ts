import {
  ForbiddenException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { AuthService } from '../auth.service'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'
import { StrategyType } from '../enums/strategy-type.enum'
import { Restaurant } from '../../restaurants/entities/restaurant.entity'

@Injectable()
export class RestaurantLocalStrategy extends PassportStrategy(
  Strategy,
  StrategyType.RESTAURANT_LOCAL
) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email', passwordField: 'password' })
  }

  async validate(email: string, password: string): Promise<Restaurant> {
    const restaurant = await this.authService.validateRestaurant(
      email,
      password
    )

    if (!restaurant) {
      throw new UnauthorizedException()
    }

    if (!restaurant.isVerified) {
      throw new ForbiddenException('Please verify your email')
    }

    return restaurant
  }
}
