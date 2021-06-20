import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { UserLocalStrategy } from './strategies/user-local.strategy'
import { UsersModule } from '../users/users.module'
import { ConfigModule } from '@nestjs/config'
import { PassportModule } from '@nestjs/passport'
import { RestaurantsModule } from '../restaurants/restaurants.module'
import { RestaurantLocalStrategy } from './strategies/restaurant-local.strategy'
import appConfig from '../config/app.config'
import tokensConfig from '../tokens/config/tokens.config'
import { RefreshJwtStrategy } from './strategies/refresh-jwt.strategy'
import { UserAccessJwtStrategy } from './strategies/user-access-jwt.strategy'
import { RestaurantAccessJwtStrategy } from './strategies/restaurant-access-jwt.strategy'
import { MailModule } from '../mail/mail.module'
import { UserVerificationJwtStrategy } from './strategies/user-verification-jwt.strategy'
import { RestaurantVerificationJwtStrategy } from './strategies/restaurant-verification-jwt.strategy'
import { TokensModule } from '../tokens/tokens.module'

@Module({
  imports: [
    ConfigModule.forFeature(appConfig),
    ConfigModule.forFeature(tokensConfig),
    PassportModule,
    UsersModule,
    RestaurantsModule,
    MailModule,
    TokensModule
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserLocalStrategy,
    UserAccessJwtStrategy,
    UserVerificationJwtStrategy,
    RestaurantLocalStrategy,
    RestaurantAccessJwtStrategy,
    RestaurantVerificationJwtStrategy,
    RefreshJwtStrategy
  ]
})
export class AuthModule {}
