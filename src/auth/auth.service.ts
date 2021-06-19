import {
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException
} from '@nestjs/common'
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
import * as crypto from 'crypto'
import { TokensResponseDto } from './dtos/tokens-response.dto'
import { UserProfileResponseDto } from '../users/dtos/user-profile-response.dto'
import { RestaurantProfileResponseDto } from '../restaurants/dtos/restaurant-profile-response.dto'
import { EntityTokenTuple } from './interfaces/entity-token-tuple.interface'
import { ResetPasswordRequestDto } from './dtos/reset-password-request.dto'

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
    const id = user.id
    const payload: JwtPayload = { id }

    const accessToken = await this.jwtService.sign(payload, {
      secret: this.authConfiguration.accessTokenSecret,
      expiresIn: this.authConfiguration.accessTokenExpiration
    })

    const refreshToken = await this.jwtService.sign(payload, {
      secret: this.authConfiguration.refreshTokenSecret,
      expiresIn: this.authConfiguration.refreshTokenExpiration
    })

    const salt = await bcrypt.genSalt()

    user.refreshTokenSalt = salt
    await user.save()

    const refreshTokenHash = await this.hashToken(refreshToken, salt)

    await this.refreshTokenRepository.createUserRefreshToken({
      user,
      hash: refreshTokenHash
    })

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
    const id = restaurant.id
    const payload: JwtPayload = { id }

    const accessToken = await this.jwtService.sign(payload, {
      secret: this.authConfiguration.accessTokenSecret,
      expiresIn: this.authConfiguration.accessTokenExpiration
    })

    const refreshToken = await this.jwtService.sign(payload, {
      secret: this.authConfiguration.refreshTokenSecret,
      expiresIn: this.authConfiguration.refreshTokenExpiration
    })

    const salt = await bcrypt.genSalt()

    restaurant.refreshTokenSalt = salt
    await restaurant.save()

    const refreshTokenHash = await this.hashToken(refreshToken, salt)

    await this.refreshTokenRepository.createRestaurantRefreshToken({
      restaurant,
      hash: refreshTokenHash
    })

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
    const user = await this.usersService.findUser({ email })
    if (user && (await this.validatePassword(password, user))) {
      return user
    } else {
      return null
    }
  }

  async validateRestaurant(
    email: string,
    password: string
  ): Promise<Restaurant> {
    const restaurant = await this.restaurantService.findRestaurant({ email })
    if (restaurant && (await this.validatePassword(password, restaurant))) {
      return restaurant
    } else {
      return null
    }
  }

  async validateUserRefreshToken(
    unhashedRefreshToken: string,
    id: number
  ): Promise<EntityTokenTuple | undefined | null> {
    const user = await this.usersService.findUser({ id })

    if (!user) {
      return null
    }

    const hashedRefreshToken = await this.hashToken(
      unhashedRefreshToken,
      user.refreshTokenSalt
    )

    let isValid = false
    for (const refreshToken of user.refreshTokens) {
      if (hashedRefreshToken === refreshToken.hash) {
        isValid = true
        break
      }
    }

    if (isValid) {
      return { entity: user, token: hashedRefreshToken }
    }
  }

  async validateRestaurantRefreshToken(
    unhashedRefreshToken: string,
    id: number
  ): Promise<EntityTokenTuple | undefined | null> {
    const restaurant = await this.restaurantService.findRestaurant({ id })

    if (!restaurant) {
      return null
    }

    const hashedRefreshToken = await this.hashToken(
      unhashedRefreshToken,
      restaurant.refreshTokenSalt
    )

    let isValid = false
    for (const refreshToken of restaurant.refreshTokens) {
      if (hashedRefreshToken === refreshToken.hash) {
        isValid = true
        break
      }
    }

    if (isValid) {
      return { entity: restaurant, token: hashedRefreshToken }
    }
  }

  async renewUserTokens(
    user: User,
    refreshToken: string
  ): Promise<TokensResponseDto> {
    const id = user.id
    const payload: JwtPayload = { id }

    const accessToken = await this.jwtService.sign(payload, {
      secret: this.authConfiguration.accessTokenSecret,
      expiresIn: this.authConfiguration.accessTokenExpiration
    })

    const unhashedRefreshToken = await this.jwtService.sign(payload, {
      secret: this.authConfiguration.refreshTokenSecret,
      expiresIn: this.authConfiguration.refreshTokenExpiration
    })

    const salt = await bcrypt.genSalt()
    user.refreshTokenSalt = salt

    try {
      await user.save()
      await this.refreshTokenRepository.delete({ hash: refreshToken })
    } catch (error) {
      throw new InternalServerErrorException(error, 'Renewing user tokens')
    }

    const hashedRefreshToken = await this.hashToken(unhashedRefreshToken, salt)

    await this.refreshTokenRepository.createUserRefreshToken({
      user,
      hash: hashedRefreshToken
    })

    const tokensResponseDto: TokensResponseDto = {
      accessToken: accessToken,
      refreshToken: unhashedRefreshToken
    }

    return tokensResponseDto
  }

  async renewRestaurantTokens(
    restaurant: Restaurant,
    refreshToken: string
  ): Promise<TokensResponseDto> {
    const id = restaurant.id
    const payload: JwtPayload = { id }

    const accessToken = await this.jwtService.sign(payload, {
      secret: this.authConfiguration.accessTokenSecret,
      expiresIn: this.authConfiguration.accessTokenExpiration
    })

    const unhashedRefreshToken = await this.jwtService.sign(payload, {
      secret: this.authConfiguration.refreshTokenSecret,
      expiresIn: this.authConfiguration.refreshTokenExpiration
    })

    const salt = await bcrypt.genSalt()
    restaurant.refreshTokenSalt = salt

    try {
      await restaurant.save()
      await this.refreshTokenRepository.delete({ hash: refreshToken })
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Renewing restaurant tokens'
      )
    }

    const hashedRefreshToken = await this.hashToken(unhashedRefreshToken, salt)

    await this.refreshTokenRepository.createRestaurantRefreshToken({
      hash: hashedRefreshToken,
      restaurant
    })

    const tokensResponseDto: TokensResponseDto = {
      accessToken: accessToken,
      refreshToken: unhashedRefreshToken
    }

    return tokensResponseDto
  }

  async renewTokens(
    entity: any,
    refreshToken: string
  ): Promise<TokensResponseDto> {
    if (!entity) {
      throw new ForbiddenException('Entity instance not found')
    }

    if (entity instanceof User) {
      console.log('Instance of USER')
      return await this.renewUserTokens(entity, refreshToken)
    }

    if (entity instanceof Restaurant) {
      console.log('Instance of RESTAURANT')
      return await this.renewRestaurantTokens(entity, refreshToken)
    }
  }

  async resetUserPassword(
    resetPasswordRequestDto: ResetPasswordRequestDto
  ): Promise<void> {
    const { email } = resetPasswordRequestDto

    const user = await this.usersService.findUser({ email })

    // If user with the given email does not exist just return
    if (!user) {
      return
    }

    const unhashedRandomPassword = crypto.randomBytes(5).toString('hex')
    const salt = await bcrypt.genSalt()
    const hashedRandomPassword = await this.usersService.hashPassword(
      unhashedRandomPassword,
      salt
    )

    user.password = hashedRandomPassword

    try {
      await user.save()
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Failed saving generated password'
      )
    }
  }

  async logout(refreshToken: string): Promise<void> {
    await this.refreshTokenRepository.delete({ hash: refreshToken })
  }

  async hashToken(token: string, salt: string): Promise<string> {
    return await bcrypt.hash(token, salt)
  }

  async validatePassword(
    password: string,
    entity: User | Restaurant
  ): Promise<boolean> {
    const hash = await bcrypt.hash(password, entity.passwordSalt)
    return hash === entity.password
  }
}
