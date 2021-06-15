import { Inject, Injectable } from '@nestjs/common'
import { User } from '../users/entities/user.entity'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from '../users/users.service'
import { UserRegistrationCredentialsDto } from './dtos/user-registration-credentials.dto'
import { JwtPayload } from './interfaces/jwt-payload.interface'
import { plainToClass } from 'class-transformer'
import { UserAuthResponseDto } from './dtos/user-auth-response.dto'
import { Restaurant } from '../restaurants/entities/restaurant.entity'
import { RestaurantsService } from '../restaurants/restaurants.service'
import { RestaurantRegistrationCredentialsDto } from './dtos/restaurant-registration-credentials.dto'
import { RestaurantAuthResponseDto } from './dtos/restaurant-auth-response.dto'
import { ConfigType } from '@nestjs/config'
import authConfig from './config/auth.config'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private restaurantService: RestaurantsService,
    private jwtService: JwtService,
    @Inject(authConfig.KEY)
    private readonly authConfiguration: ConfigType<typeof authConfig>
  ) {}

  async registerUser(
    userRegistrationCredentialsDto: UserRegistrationCredentialsDto
  ): Promise<{ message: string }> {
    await this.usersService.createUser(userRegistrationCredentialsDto)
    return { message: 'Successfully registered' }
  }

  async loginUser(user: User): Promise<UserAuthResponseDto> {
    const email = user.email
    const payload: JwtPayload = { email }

    const accessToken = await this.jwtService.sign(payload, {
      secret: this.authConfiguration.accessTokenSecret,
      expiresIn: this.authConfiguration.accessTokenExpiration
    })

    const userAuthResponseDto = plainToClass(UserAuthResponseDto, user, {
      excludeExtraneousValues: true
    })

    userAuthResponseDto.accessToken = accessToken

    return userAuthResponseDto
  }

  async registerRestaurant(
    restaurantRegistrationCredentialsDto: RestaurantRegistrationCredentialsDto
  ): Promise<{ message: string }> {
    await this.restaurantService.createRestaurant(
      restaurantRegistrationCredentialsDto
    )
    return { message: 'Successfully registered' }
  }

  async loginRestaurant(
    restaurant: Restaurant
  ): Promise<RestaurantAuthResponseDto> {
    const email = restaurant.email
    const payload: JwtPayload = { email }
    const accessToken = await this.jwtService.sign(payload, {
      secret: this.authConfiguration.accessTokenSecret,
      expiresIn: this.authConfiguration.accessTokenExpiration
    })

    const restaurantAuthResponseDto = plainToClass(
      RestaurantAuthResponseDto,
      restaurant,
      {
        excludeExtraneousValues: true
      }
    )

    restaurantAuthResponseDto.accessToken = accessToken

    return restaurantAuthResponseDto
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findUser(email)
    if (user && (await user.validatePassword(password))) {
      return user
    } else {
      return null
    }
  }

  async validateRestaurant(
    email: string,
    password: string
  ): Promise<Restaurant> {
    console.log(email)
    const restaurant = await this.restaurantService.findRestaurant(email)
    if (restaurant && (await restaurant.validatePassword(password))) {
      return restaurant
    } else {
      return null
    }
  }
}
