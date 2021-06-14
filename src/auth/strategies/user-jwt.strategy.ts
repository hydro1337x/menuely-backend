import { Injectable, UnauthorizedException } from '@nestjs/common'
import { UsersService } from '../../users/users.service'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { ConfigService } from '@nestjs/config'
import { User } from '../../users/entities/user.entity'
import { JwtPayload } from '../interfaces/jwt-payload.interface'
import { StrategyType } from '../enums/strategy-type.enum'

@Injectable()
export class UserJwtStrategy extends PassportStrategy(
  Strategy,
  StrategyType.USER_JWT
) {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('APP_SECRET')
    })
  }

  async validate(payload: JwtPayload): Promise<User> {
    const { email } = payload
    const user = await this.usersService.findUser(email)

    if (!user) {
      throw new UnauthorizedException()
    }

    return user
  }
}
