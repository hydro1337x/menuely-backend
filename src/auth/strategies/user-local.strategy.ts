import { Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthService } from '../auth.service'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'
import { User } from '../../users/entities/user.entity'
import { StrategyType } from '../enums/strategy-type.enum'

@Injectable()
export class UserLocalStrategy extends PassportStrategy(
  Strategy,
  StrategyType.USER_LOCAL
) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email', passwordField: 'password' })
  }

  async validate(email: string, password: string): Promise<User> {
    console.log(password)
    const user = await this.authService.validateUser(email, password)
    if (!user) {
      throw new UnauthorizedException()
    }
    return user
  }
}
