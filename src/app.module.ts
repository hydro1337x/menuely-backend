import { Module } from '@nestjs/common'
import { TypeOrmConfigService } from './config/type-orm-config.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config'
import * as Joi from '@hapi/joi'
import { FilesModule } from './files/files.module'

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService
    }),
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        DATABASE_HOST: Joi.required(),
        DATABASE_PORT: Joi.number().default(5432),
        JWT_EXPIRATION: Joi.number().default(3600)
      })
    }),
    FilesModule
  ]
})
export class AppModule {}
