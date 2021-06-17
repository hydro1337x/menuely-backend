import { Module } from '@nestjs/common'
import { TypeOrmConfigService } from './config/type-orm-config.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config'
import * as Joi from '@hapi/joi'
import { FilesModule } from './files/files.module'
import { UsersModule } from './users/users.module'
import { AuthModule } from './auth/auth.module'
import { RestaurantsModule } from './restaurants/restaurants.module'
import { OrdersGateway } from './gateways/orders.gateway'

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService
    }),
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        DATABASE_PORT: Joi.number().default(5432),
        ACCESS_TOKEN_SECRET: Joi.string(),
        ACCESS_TOKEN_EXPIRATION: Joi.number().default(3600),
        REFRESH_TOKEN_SECRET: Joi.string(),
        REFRESH_TOKEN_EXPIRATION: Joi.number().default(1314000),
        VERIFICATION_TOKEN_SECRET: Joi.string(),
        VERIFICATION_TOKEN_EXPIRATION: Joi.number().default(3600)
      })
    }),
    FilesModule,
    UsersModule,
    AuthModule,
    RestaurantsModule
  ],
  providers: [OrdersGateway]
})
export class AppModule {}
