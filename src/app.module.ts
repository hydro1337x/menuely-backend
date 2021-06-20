import { Module } from '@nestjs/common'
import { TypeOrmConfigService } from './database/type-orm-config.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config'
import * as Joi from '@hapi/joi'
import { FilesModule } from './files/files.module'
import { UsersModule } from './users/users.module'
import { AuthModule } from './auth/auth.module'
import { RestaurantsModule } from './restaurants/restaurants.module'
import { OrdersGateway } from './gateways/orders.gateway'
import { MailModule } from './mail/mail.module'
import { TokensModule } from './tokens/tokens.module';
import databaseConfig from './database/config/database.config'
import appConfig from './config/app.config'

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [
        ConfigModule.forFeature(databaseConfig), // Needed to Inject databaseConfig inside TypeOrmConfigService
        ConfigModule.forFeature(appConfig)
      ],
      useClass: TypeOrmConfigService
    }),
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        DATABASE_PORT: Joi.number().default(5432),
        ACCESS_TOKEN_SECRET: Joi.string(),
        ACCESS_TOKEN_EXPIRATION: Joi.number().default(3600),
        REFRESH_TOKEN_SECRET: Joi.string(),
        REFRESH_TOKEN_EXPIRATION: Joi.number().default(31536000),
        VERIFICATION_TOKEN_SECRET: Joi.string(),
        VERIFICATION_TOKEN_EXPIRATION: Joi.number().default(3600)
      }),
      load: [appConfig] // Same as typing ConfigModule.forFeature, needed to Inject appConfig inside OrdersGateway provider
    }),
    FilesModule,
    UsersModule,
    AuthModule,
    RestaurantsModule,
    MailModule,
    TokensModule
  ],
  providers: [OrdersGateway]
})
export class AppModule {}
