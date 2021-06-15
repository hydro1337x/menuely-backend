import { EntityRepository, Repository } from 'typeorm'
import { RefreshToken } from './entities/refresh-token.entity'
import { InternalServerErrorException } from '@nestjs/common'
import { User } from '../users/entities/user.entity'
import { Restaurant } from '../restaurants/entities/restaurant.entity'

@EntityRepository(RefreshToken)
export class RefreshTokenRepository extends Repository<RefreshToken> {
  async createUserRefreshToken(
    user: User,
    value: string
  ): Promise<RefreshToken> {
    const refreshToken = new RefreshToken()
    refreshToken.value = value
    refreshToken.user = user
    try {
      await refreshToken.save()
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Failed creating Refresh Token'
      )
    }

    return refreshToken
  }

  async createRestaurantRefreshToken(
    restaurant: Restaurant,
    value: string
  ): Promise<RefreshToken> {
    const refreshToken = new RefreshToken()
    refreshToken.value = value
    refreshToken.restaurant = restaurant
    try {
      await refreshToken.save()
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Failed creating Refresh Token'
      )
    }

    return refreshToken
  }
}
