import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { UserLocalStrategy } from './strategies/user-local.strategy'
import { JwtModule } from '@nestjs/jwt'
import { UsersModule } from '../users/users.module'
import { ConfigModule } from '@nestjs/config'
import { PassportModule } from '@nestjs/passport'
import { RestaurantsModule } from '../restaurants/restaurants.module'
import { RestaurantLocalStrategy } from './strategies/restaurant-local.strategy'
import authConfig from './config/auth.config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RefreshTokenRepository } from './refresh-token.repository'
import { RefreshJwtStrategy } from './strategies/refresh-jwt.strategy'
import { UserAccessJwtStrategy } from './strategies/user-access-jwt.strategy'
import { RestaurantAccessJwtStrategy } from './strategies/restaurant-access-jwt.strategy'

@Module({
  imports: [
    ConfigModule.forFeature(authConfig),
    TypeOrmModule.forFeature([RefreshTokenRepository]),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.APP_SECRET,
        signOptions: {
          expiresIn: +process.env.ACCESS_JWT_EXPIRATION
        }
      })
    }),
    PassportModule,
    UsersModule,
    RestaurantsModule
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserLocalStrategy,
    UserAccessJwtStrategy,
    RefreshJwtStrategy,
    RestaurantLocalStrategy,
    RestaurantAccessJwtStrategy
  ]
})
export class AuthModule {}
