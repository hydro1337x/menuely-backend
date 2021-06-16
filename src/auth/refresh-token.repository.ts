import { EntityRepository, Repository } from 'typeorm'
import { RefreshToken } from './entities/refresh-token.entity'
import { Inject, InternalServerErrorException } from '@nestjs/common'
import { User } from '../users/entities/user.entity'
import { Restaurant } from '../restaurants/entities/restaurant.entity'
import * as bcrypt from 'bcrypt'
import authConfig from './config/auth.config'
import { ConfigType } from '@nestjs/config'

@EntityRepository(RefreshToken)
export class RefreshTokenRepository extends Repository<RefreshToken> {
  constructor(
    @Inject(authConfig.KEY)
    private readonly authConfiguration: ConfigType<typeof authConfig>
  ) {
    super()
  }
  async createUserRefreshToken(
    user: User,
    refreshTokenHash: string
  ): Promise<void> {
    const refreshToken = new RefreshToken()

    refreshToken.hash = refreshTokenHash
    refreshToken.user = user

    try {
      await refreshToken.save()
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Failed creating Refresh Token'
      )
    }
  }

  async createRestaurantRefreshToken(
    restaurant: Restaurant,
    refreshTokenHash: string
  ): Promise<void> {
    const refreshToken = new RefreshToken()

    refreshToken.hash = refreshTokenHash
    refreshToken.restaurant = restaurant

    try {
      await refreshToken.save()
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Failed creating Refresh Token'
      )
    }
  }
}
