import { Injectable } from '@nestjs/common'
import { User } from '../users/entities/user.entity'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from '../users/users.service'
import { UserRegistrationCredentialsDto } from './dtos/user-registration-credentials.dto'
import { JwtPayload } from './interfaces/jwt-payload.interface'
import { plainToClass } from 'class-transformer'
import { UserAuthResponseDto } from './dtos/user-auth-response.dto'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async registerUser(
    registrationCredentialsDto: UserRegistrationCredentialsDto
  ): Promise<{ message: string }> {
    await this.usersService.createUser(registrationCredentialsDto)
    return { message: 'Successfully registered' }
  }

  async loginUser(user: User): Promise<UserAuthResponseDto> {
    const email = user.email
    const payload: JwtPayload = { email }
    const accessToken = await this.jwtService.sign(payload)

    const authenticatedUserDto = plainToClass(UserAuthResponseDto, user, {
      excludeExtraneousValues: true
    })

    authenticatedUserDto.accessToken = accessToken

    return authenticatedUserDto
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findUser(email)
    if (user && (await user.validatePassword(password))) {
      return user
    } else {
      return null
    }
  }
}
