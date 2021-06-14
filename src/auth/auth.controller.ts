import {
  Body,
  Controller,
  HttpCode,
  Post,
  UseGuards,
  ValidationPipe
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { UserRegistrationCredentialsDto } from './dtos/user-registration-credentials.dto'
import { UserAuthResponseDto } from './dtos/user-auth-response.dto'
import { UserLocalAuthGuard } from './guards/user-local-auth.guard'
import { AuthenticatedUser } from './decorators/authenticated-user.decorator'
import { RestaurantRegistrationCredentialsDto } from './dtos/restaurant-registration-credentials.dto'
import { RestaurantLocalAuthGuard } from './guards/restaurant-local-auth.guard'
import { AuthenticatedRestaurant } from './decorators/authenticated-restaurant.decorator'
import { RestaurantAuthResponseDto } from './dtos/restaurant-auth-response.dto'
import { User } from '../users/entities/user.entity'
import { Restaurant } from '../restaurants/entities/restaurant.entity'

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
  loginUser(@AuthenticatedUser() user: User): Promise<UserAuthResponseDto> {
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
    @AuthenticatedRestaurant() restaurant: Restaurant
  ): Promise<RestaurantAuthResponseDto> {
    console.log(restaurant)
    return this.authService.loginRestaurant(restaurant)
  }
}
