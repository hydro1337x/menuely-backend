import { Inject, Injectable } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import tokensConfig from './config/tokens.config'
import { CreateUserRefreshTokenParams } from './interfaces/create-user-refresh-token-params.interface'
import { InjectRepository } from '@nestjs/typeorm'
import { RefreshTokensRepository } from './refresh-tokens.repository'
import { CreateRestaurantRefreshTokenParams } from './interfaces/create-restaurant-refresh-token-params.interface'
import { JwtPayload } from './interfaces/jwt-payload.interface'
import { JwtSignType } from './enums/jwt-sign-type.enum'
import { JwtService } from '@nestjs/jwt'
import { JwtSignOptions } from '@nestjs/jwt/dist/interfaces/jwt-module-options.interface'

@Injectable()
export class TokensService {
  constructor(
    @Inject(tokensConfig.KEY)
    private readonly tokensConfiguration: ConfigType<typeof tokensConfig>,
    @InjectRepository(RefreshTokensRepository)
    private readonly tokensRepository: RefreshTokensRepository,
    private readonly jwtService: JwtService
  ) {}

  signToken(payload: JwtPayload, jwtSignType: JwtSignType): string {
    let options: JwtSignOptions

    if (jwtSignType === JwtSignType.ACCESS) {
      options = {
        secret: this.tokensConfiguration.accessTokenSecret,
        expiresIn: this.tokensConfiguration.accessTokenExpiration
      }
    }

    if (jwtSignType === JwtSignType.REFRESH) {
      options = {
        secret: this.tokensConfiguration.refreshTokenSecret,
        expiresIn: this.tokensConfiguration.refreshTokenExpiration
      }
    }

    if (jwtSignType === JwtSignType.VERIFICATION) {
      options = {
        secret: this.tokensConfiguration.verificationTokenSecret,
        expiresIn: this.tokensConfiguration.verificationTokenExpiration
      }
    }

    const token = this.jwtService.sign(payload, options)

    return token
  }

  async createUserRefreshToken(
    createUserRefreshTokenParams: CreateUserRefreshTokenParams
  ): Promise<void> {
    return await this.tokensRepository.createUserRefreshToken(
      createUserRefreshTokenParams
    )
  }

  async createRestaurantRefreshToken(
    createRestaurantRefreshTokenParams: CreateRestaurantRefreshTokenParams
  ): Promise<void> {
    return await this.tokensRepository.createRestaurantRefreshToken(
      createRestaurantRefreshTokenParams
    )
  }

  async deleteRefreshToken(hash: string): Promise<void> {
    await this.tokensRepository.delete({ hash })
  }
}
