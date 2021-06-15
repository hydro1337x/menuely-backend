import { EntityRepository, Repository } from 'typeorm'
import { RefreshToken } from './entities/refresh-token.entity'
import { InternalServerErrorException } from '@nestjs/common'
import { User } from '../users/entities/user.entity'
import { Restaurant } from '../restaurants/entities/restaurant.entity'
import * as bcrypt from 'bcrypt'

@EntityRepository(RefreshToken)
export class RefreshTokenRepository extends Repository<RefreshToken> {
  async createUserRefreshToken(
    user: User,
    unhashedRefreshToken: string
  ): Promise<void> {
    const refreshToken = new RefreshToken()

    const hashedRefreshToken = await bcrypt.hash(unhashedRefreshToken, 10)
    refreshToken.hash = hashedRefreshToken
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
    unhashedRefreshToken: string
  ): Promise<void> {
    const refreshToken = new RefreshToken()

    const hashedRefreshToken = await bcrypt.hash(unhashedRefreshToken, 10)
    refreshToken.hash = hashedRefreshToken
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
