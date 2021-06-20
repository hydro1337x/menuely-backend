import { Module } from '@nestjs/common'
import { TokensService } from './tokens.service'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule } from '@nestjs/config'
import tokensConfig from './config/tokens.config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RefreshTokensRepository } from './refresh-tokens.repository'

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshTokensRepository]),
    JwtModule.register({}),
    ConfigModule.forFeature(tokensConfig)
  ],
  providers: [TokensService],
  exports: [TokensService]
})
export class TokensModule {}
