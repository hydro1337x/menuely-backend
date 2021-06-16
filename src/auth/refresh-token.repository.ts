import { EntityRepository, Repository } from 'typeorm'
import { RefreshToken } from './entities/refresh-token.entity'
import { Inject, InternalServerErrorException } from '@nestjs/common'
import authConfig from './config/auth.config'
import { ConfigType } from '@nestjs/config'
import { CreateRestaurantRefreshTokenParams } from './interfaces/create-restaurant-refresh-token-params.interface'
import { CreateUserRefreshTokenParams } from './interfaces/create-user-refresh-token-params.interface'

@EntityRepository(RefreshToken)
export class RefreshTokenRepository extends Repository<RefreshToken> {
  constructor(
    @Inject(authConfig.KEY)
    private readonly authConfiguration: ConfigType<typeof authConfig>
  ) {
    super()
  }
  async createUserRefreshToken(
    createUserRefreshTokenParams: CreateUserRefreshTokenParams
  ): Promise<void> {
    const { hash, user } = createUserRefreshTokenParams
    const refreshToken = new RefreshToken()

    refreshToken.hash = hash
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
    createRestaurantRefreshTokenParams: CreateRestaurantRefreshTokenParams
  ): Promise<void> {
    const { hash, restaurant } = createRestaurantRefreshTokenParams
    const refreshToken = new RefreshToken()

    refreshToken.hash = hash
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
