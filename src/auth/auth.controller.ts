import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Res,
  UseGuards,
  ValidationPipe
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { UserRegistrationCredentialsDto } from './dtos/user-registration-credentials.dto'
import { UserAuthResponseDto } from './dtos/user-auth-response.dto'
import { UserLocalAuthGuard } from './guards/user-local-auth.guard'
import { AuthenticatedEntity } from './decorators/authenticated-entity.decorator'
import { RestaurantRegistrationCredentialsDto } from './dtos/restaurant-registration-credentials.dto'
import { RestaurantLocalAuthGuard } from './guards/restaurant-local-auth.guard'
import { RestaurantAuthResponseDto } from './dtos/restaurant-auth-response.dto'
import { User } from '../users/entities/user.entity'
import { Restaurant } from '../restaurants/entities/restaurant.entity'
import { TokensResponseDto } from './dtos/tokens-response.dto'
import { RefreshJwtAuthGuard } from './guards/refresh-jwt-auth.guard'
import { RefreshToken } from './decorators/refresh-token.decorator'
import { ResetPasswordRequestDto } from './dtos/reset-password-request.dto'
import { UserVerificationJwtAuthGuard } from './guards/user-verification-jwt-auth.guard'
import { RestaurantVerificationJwtAuthGuard } from './guards/restaurant-verification-jwt-auth.guard'
import { Response } from 'express'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register/user')
  registerUser(
    @Body(ValidationPipe)
    userRegistrationCredentialsDto: UserRegistrationCredentialsDto
  ): Promise<{ message: string }> {
    return this.authService.registerUser(userRegistrationCredentialsDto)
  }

  @Post('login/user')
  @HttpCode(200)
  @UseGuards(UserLocalAuthGuard)
  loginUser(@AuthenticatedEntity() user: User): Promise<UserAuthResponseDto> {
    return this.authService.loginUser(user)
  }

  @Post('register/restaurant')
  registerRestaurant(
    @Body(ValidationPipe)
    restaurantRegistrationCredentialsDto: RestaurantRegistrationCredentialsDto
  ): Promise<{ message: string }> {
    return this.authService.registerRestaurant(
      restaurantRegistrationCredentialsDto
    )
  }

  @Post('login/restaurant')
  @HttpCode(200)
  @UseGuards(RestaurantLocalAuthGuard)
  loginRestaurant(
    @AuthenticatedEntity() restaurant: Restaurant
  ): Promise<RestaurantAuthResponseDto> {
    return this.authService.loginRestaurant(restaurant)
  }

  @Post('refresh-token')
  @UseGuards(RefreshJwtAuthGuard)
  refreshToken(
    @RefreshToken() refreshToken: string,
    @AuthenticatedEntity() entity
  ): Promise<TokensResponseDto> {
    return this.authService.renewTokens(entity, refreshToken)
  }

  @Post('reset-password/user')
  resetUserPassword(
    @Body(ValidationPipe) resetPasswordRequestDto: ResetPasswordRequestDto
  ): Promise<void> {
    return this.authService.resetUserPassword(resetPasswordRequestDto)
  }

  @Post('reset-password/restaurant')
  resetRestaurantPassword(
    @Body(ValidationPipe) resetPasswordRequestDto: ResetPasswordRequestDto
  ): Promise<void> {
    return this.authService.resetRestaurantPassword(resetPasswordRequestDto)
  }

  @Get('verify/user')
  @UseGuards(UserVerificationJwtAuthGuard)
  async verifyUser(
    @Res() response: Response,
    @AuthenticatedEntity() user: User
  ): Promise<void> {
    const verifyResponseDto = await this.authService.verifyUser(user)

    return response.render('verified', verifyResponseDto)
  }

  @Get('verify/restaurant')
  @UseGuards(RestaurantVerificationJwtAuthGuard)
  async verifyRestaurant(
    @Res() response: Response,
    @AuthenticatedEntity() restaurant: Restaurant
  ) {
    const verifyResponseDto = await this.authService.verifyRestaurant(
      restaurant
    )

    return response.render('verified', verifyResponseDto)
  }

  @Delete('logout')
  @UseGuards(RefreshJwtAuthGuard)
  logout(@RefreshToken() refreshToken: string): Promise<void> {
    return this.authService.logout(refreshToken)
  }
}
