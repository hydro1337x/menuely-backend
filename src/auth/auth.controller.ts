import {
  Body,
  Controller,
  Post,
  UseGuards,
  ValidationPipe
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { UserRegistrationCredentialsDto } from './dtos/user-registration-credentials.dto'
import { UserAuthResponseDto } from './dtos/user-auth-response.dto'
import { UserLocalAuthGuard } from './guards/user-local-auth.guard'
import { AuthenticatedUser } from './decorators/authenticated-user.decorator'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register/user')
  registerUser(
    @Body(ValidationPipe)
    registrationCredentialsDto: UserRegistrationCredentialsDto
  ): Promise<{ message: string }> {
    return this.authService.registerUser(registrationCredentialsDto)
  }

  @UseGuards(UserLocalAuthGuard)
  @Post('login/user')
  loginUser(@AuthenticatedUser() user): Promise<UserAuthResponseDto> {
    return this.authService.loginUser(user)
  }
}
