import { EntityRepository, Repository } from 'typeorm'
import { RefreshToken } from '../auth/entities/refresh-token.entity'
import { Inject, InternalServerErrorException } from '@nestjs/common'
import tokensConfig from './config/tokens.config'
import { ConfigType } from '@nestjs/config'
import { CreateUserRefreshTokenParams } from './interfaces/create-user-refresh-token-params.interface'
import { CreateRestaurantRefreshTokenParams } from './interfaces/create-restaurant-refresh-token-params.interface'

@EntityRepository(RefreshToken)
export class RefreshTokensRepository extends Repository<RefreshToken> {
  constructor(
    @Inject(tokensConfig.KEY)
    private readonly tokensConfiguration: ConfigType<typeof tokensConfig>
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
