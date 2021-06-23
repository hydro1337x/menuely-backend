import {
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException
} from '@nestjs/common'
import { User } from '../users/entities/user.entity'
import { UsersService } from '../users/users.service'
import { UserRegistrationCredentialsDto } from './dtos/user-registration-credentials.dto'
import { JwtPayload } from '../tokens/interfaces/jwt-payload.interface'
import { plainToClass } from 'class-transformer'
import { UserAuthResponseDto } from './dtos/user-auth-response.dto'
import { Restaurant } from '../restaurants/entities/restaurant.entity'
import { RestaurantsService } from '../restaurants/restaurants.service'
import { RestaurantRegistrationCredentialsDto } from './dtos/restaurant-registration-credentials.dto'
import { RestaurantAuthResponseDto } from './dtos/restaurant-auth-response.dto'
import { ConfigType } from '@nestjs/config'
import appConfig from '../config/app.config'
import * as bcrypt from 'bcrypt'
import * as crypto from 'crypto'
import { TokensResponseDto } from './dtos/tokens-response.dto'
import { UserProfileResponseDto } from '../users/dtos/user-profile-response.dto'
import { RestaurantProfileResponseDto } from '../restaurants/dtos/restaurant-profile-response.dto'
import { EntityTokenTuple } from '../tokens/interfaces/entity-token-tuple.interface'
import { ResetPasswordRequestDto } from './dtos/reset-password-request.dto'
import { MailService } from '../mail/mail.service'
import { VerifyResponseDto } from './dtos/verify-response.dto'
import { TokensService } from '../tokens/tokens.service'
import { JwtSignType } from '../tokens/enums/jwt-sign-type.enum'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly restaurantsService: RestaurantsService,
    private readonly mailService: MailService,
    private readonly tokensService: TokensService,
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>
  ) {}

  async registerUser(
    userRegistrationCredentialsDto: UserRegistrationCredentialsDto
  ): Promise<{ message: string }> {
    const user = await this.usersService.createUser(
      userRegistrationCredentialsDto
    )

    const { email, firstname } = userRegistrationCredentialsDto

    const payload: JwtPayload = { id: user.id }

    const token = this.tokensService.signToken(
      payload,
      JwtSignType.VERIFICATION
    )

    const base = this.appConfiguration.baseUrl

    const url = new URL(base + '/auth/verify/user')

    url.searchParams.append('token', token)

    await this.mailService.sendVerification({
      email,
      name: firstname,
      url: url.toString()
    })

    return { message: 'Successfully registered' }
  }

  async loginUser(user: User): Promise<UserAuthResponseDto> {
    const id = user.id
    const payload: JwtPayload = { id }

    const accessToken = this.tokensService.signToken(
      payload,
      JwtSignType.ACCESS
    )

    const refreshToken = this.tokensService.signToken(
      payload,
      JwtSignType.REFRESH
    )

    const salt = await bcrypt.genSalt()

    user.refreshTokenSalt = salt
    await user.save()

    const refreshTokenHash = await this.hashToken(refreshToken, salt)

    await this.tokensService.createUserRefreshToken({
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
    const restaurant = await this.restaurantsService.createRestaurant(
      restaurantRegistrationCredentialsDto
    )

    const { email, name } = restaurantRegistrationCredentialsDto

    const payload: JwtPayload = { id: restaurant.id }

    const token = this.tokensService.signToken(
      payload,
      JwtSignType.VERIFICATION
    )

    const base = this.appConfiguration.baseUrl

    const url = new URL(base + '/auth/verify/restaurant')

    url.searchParams.append('token', token)

    await this.mailService.sendVerification({
      email,
      name: name,
      url: url.toString()
    })

    return { message: 'Successfully registered' }
  }

  async loginRestaurant(
    restaurant: Restaurant
  ): Promise<RestaurantAuthResponseDto> {
    const id = restaurant.id
    const payload: JwtPayload = { id }

    const accessToken = await this.tokensService.signToken(
      payload,
      JwtSignType.ACCESS
    )

    const refreshToken = await this.tokensService.signToken(
      payload,
      JwtSignType.REFRESH
    )

    const salt = await bcrypt.genSalt()

    restaurant.refreshTokenSalt = salt
    await restaurant.save()

    const refreshTokenHash = await this.hashToken(refreshToken, salt)

    await this.tokensService.createRestaurantRefreshToken({
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
    const restaurant = await this.restaurantsService.findRestaurant({ email })
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
    const restaurant = await this.restaurantsService.findRestaurant({ id })

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

    const accessToken = this.tokensService.signToken(
      payload,
      JwtSignType.ACCESS
    )

    const unhashedRefreshToken = await this.tokensService.signToken(
      payload,
      JwtSignType.REFRESH
    )

    const salt = await bcrypt.genSalt()
    user.refreshTokenSalt = salt

    try {
      await user.save()
      await this.tokensService.deleteRefreshToken(refreshToken)
    } catch (error) {
      throw new InternalServerErrorException(error, 'Renewing user tokens')
    }

    const hashedRefreshToken = await this.hashToken(unhashedRefreshToken, salt)

    await this.tokensService.createUserRefreshToken({
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

    const accessToken = this.tokensService.signToken(
      payload,
      JwtSignType.ACCESS
    )

    const unhashedRefreshToken = await this.tokensService.signToken(
      payload,
      JwtSignType.REFRESH
    )

    const salt = await bcrypt.genSalt()
    restaurant.refreshTokenSalt = salt

    try {
      await restaurant.save()
      await this.tokensService.deleteRefreshToken(refreshToken)
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Renewing restaurant tokens'
      )
    }

    const hashedRefreshToken = await this.hashToken(unhashedRefreshToken, salt)

    await this.tokensService.createRestaurantRefreshToken({
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

    user.passwordSalt = salt
    user.password = hashedRandomPassword

    try {
      await user.save()
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Failed saving generated password'
      )
    }

    await this.mailService.sendResetPassword({
      email: user.email,
      name: user.firstname,
      password: unhashedRandomPassword
    })
  }

  async resetRestaurantPassword(
    resetPasswordRequestDto: ResetPasswordRequestDto
  ): Promise<void> {
    const { email } = resetPasswordRequestDto

    const restaurant = await this.restaurantsService.findRestaurant({ email })

    // If restaurant with the given email does not exist just return
    if (!restaurant) {
      return
    }

    const unhashedRandomPassword = crypto.randomBytes(5).toString('hex')
    const salt = await bcrypt.genSalt()
    const hashedRandomPassword = await this.restaurantsService.hashPassword(
      unhashedRandomPassword,
      salt
    )

    restaurant.passwordSalt = salt
    restaurant.password = hashedRandomPassword

    try {
      await restaurant.save()
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Failed saving generated password'
      )
    }

    await this.mailService.sendResetPassword({
      email: restaurant.email,
      name: restaurant.name,
      password: unhashedRandomPassword
    })
  }

  async verifyUser(user: User): Promise<VerifyResponseDto> {
    if (user.isVerified) {
      return {
        title: 'Email Verification',
        message: 'You are already verified!'
      }
    }
    user.isVerified = true

    try {
      await user.save()
    } catch (error) {
      throw new InternalServerErrorException(error, 'Failed verifying user')
    }

    return {
      title: 'Email Verification',
      message: 'You are successfully verified your email!'
    }
  }

  async verifyRestaurant(restaurant: Restaurant): Promise<VerifyResponseDto> {
    if (restaurant.isVerified) {
      return {
        title: 'Email Verification',
        message: 'You are already verified!'
      }
    }

    restaurant.isVerified = true

    try {
      await restaurant.save()
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Failed verifying restaurant'
      )
    }

    return {
      title: 'Email Verification',
      message: 'You are successfully verified your email!'
    }
  }

  async logout(refreshToken: string): Promise<void> {
    await this.tokensService.deleteRefreshToken(refreshToken)
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
