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

@Module({
  imports: [
    ConfigModule.forFeature(authConfig),
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
  providers: [AuthService, UserLocalStrategy, RestaurantLocalStrategy]
})
export class AuthModule {}
