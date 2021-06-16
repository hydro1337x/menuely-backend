import { ForbiddenException, Inject, Injectable } from '@nestjs/common'
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
import { InjectRepository } from '@nestjs/typeorm'
import { RefreshTokenRepository } from './refresh-token.repository'
import * as bcrypt from 'bcrypt'
import { TokensResponseDto } from './dtos/tokens-response.dto'
import { UserProfileResponseDto } from '../users/dtos/user-profile-response.dto'
import { RestaurantProfileResponseDto } from '../restaurants/dtos/restaurant-profile-response.dto'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private restaurantService: RestaurantsService,
    private jwtService: JwtService,
    @Inject(authConfig.KEY)
    private readonly authConfiguration: ConfigType<typeof authConfig>,
    @InjectRepository(RefreshTokenRepository)
    private readonly refreshTokenRepository: RefreshTokenRepository
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

    const refreshToken = await this.jwtService.sign(payload, {
      secret: this.authConfiguration.refreshTokenSecret,
      expiresIn: this.authConfiguration.refreshTokenExpiration
    })

    await this.refreshTokenRepository.createUserRefreshToken(user, refreshToken)

    const userProfileResponseDto = plainToClass(UserProfileResponseDto, user, {
      excludeExtraneousValues: true
    })

    const tokens: TokensResponseDto = { accessToken, refreshToken }

    const userAuthResponseDto: UserAuthResponseDto = {
      user: userProfileResponseDto,
      auth: tokens
    }

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

    const refreshToken = await this.jwtService.sign(payload, {
      secret: this.authConfiguration.refreshTokenSecret,
      expiresIn: this.authConfiguration.refreshTokenExpiration
    })

    await this.refreshTokenRepository.createRestaurantRefreshToken(
      restaurant,
      refreshToken
    )

    const restaurantProfileResponseDto = plainToClass(
      RestaurantProfileResponseDto,
      restaurant,
      {
        excludeExtraneousValues: true
      }
    )

    const tokens: TokensResponseDto = { accessToken, refreshToken }

    const restaurantAuthResponseDto: RestaurantAuthResponseDto = {
      restaurant: restaurantProfileResponseDto,
      auth: tokens
    }

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
    const restaurant = await this.restaurantService.findRestaurant(email)
    if (restaurant && (await restaurant.validatePassword(password))) {
      return restaurant
    } else {
      return null
    }
  }

  async validateUserRefreshToken(
    refreshTokenHash: string,
    email: string
  ): Promise<User | undefined | null> {
    const user = await this.usersService.findUser(email)

    if (!user) {
      return null
    }

    let isValid = false
    for (const refreshToken of user.refreshTokens) {
      if (await bcrypt.compare(refreshTokenHash, refreshToken.hash)) {
        isValid = true
        break
      }
    }

    if (isValid) {
      return user
    }
  }

  async validateRestaurantRefreshToken(
    refreshTokenHash: string,
    email: string
  ): Promise<Restaurant | undefined | null> {
    const restaurant = await this.restaurantService.findRestaurant(email)

    if (!restaurant) {
      return null
    }

    let isValid = false
    for (const refreshToken of restaurant.refreshTokens) {
      if (await bcrypt.compare(refreshTokenHash, refreshToken.hash)) {
        isValid = true
        break
      }
    }

    if (isValid) {
      return restaurant
    }
  }

  async renewUserTokens(user: User): Promise<TokensResponseDto> {
    const email = user.email
    const payload: JwtPayload = { email }

    const accessToken = await this.jwtService.sign(payload, {
      secret: this.authConfiguration.accessTokenSecret,
      expiresIn: this.authConfiguration.accessTokenExpiration
    })

    const refreshToken = await this.jwtService.sign(payload, {
      secret: this.authConfiguration.refreshTokenSecret,
      expiresIn: this.authConfiguration.refreshTokenExpiration
    })

    await this.refreshTokenRepository.createUserRefreshToken(user, refreshToken)

    const tokensResponseDto: TokensResponseDto = {
      accessToken: accessToken,
      refreshToken: refreshToken
    }

    return tokensResponseDto
  }

  async renewRestaurantTokens(
    restaurant: Restaurant
  ): Promise<TokensResponseDto> {
    const email = restaurant.email
    const payload: JwtPayload = { email }

    const accessToken = await this.jwtService.sign(payload, {
      secret: this.authConfiguration.accessTokenSecret,
      expiresIn: this.authConfiguration.accessTokenExpiration
    })

    const refreshToken = await this.jwtService.sign(payload, {
      secret: this.authConfiguration.refreshTokenSecret,
      expiresIn: this.authConfiguration.refreshTokenExpiration
    })

    await this.refreshTokenRepository.createRestaurantRefreshToken(
      restaurant,
      refreshToken
    )

    const tokensResponseDto: TokensResponseDto = {
      accessToken: accessToken,
      refreshToken: refreshToken
    }

    return tokensResponseDto
  }

  async renewTokens(entity: any): Promise<TokensResponseDto> {
    if (!entity) {
      throw new ForbiddenException('Entity instance not found')
    }

    if (entity instanceof User) {
      console.log('Instance of USER')
      return await this.renewUserTokens(entity)
    }

    if (entity instanceof Restaurant) {
      console.log('Instance of RESTAURANT')
      return await this.renewRestaurantTokens(entity)
    }
  }
}
