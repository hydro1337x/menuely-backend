import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { UserLocalStrategy } from './strategies/user-local.strategy'
import { JwtModule } from '@nestjs/jwt'
import { UsersModule } from '../users/users.module'
import { ConfigModule } from '@nestjs/config'
import { PassportModule } from '@nestjs/passport'

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.APP_SECRET,
        signOptions: {
          expiresIn: +process.env.JWT_EXPIRATION
        }
      })
    }),
    PassportModule,
    UsersModule,
    ConfigModule
  ],
  controllers: [AuthController],
  providers: [AuthService, UserLocalStrategy]
})
export class AuthModule {}
