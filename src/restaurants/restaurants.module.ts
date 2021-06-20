import { Module } from '@nestjs/common'
import { RestaurantsController } from './restaurants.controller'
import { RestaurantsService } from './restaurants.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RestaurantsRepository } from './restaurants.repository'
import { FilesModule } from '../files/files.module'
import { ConfigModule } from '@nestjs/config'
import appConfig from '../config/app.config'
import { MailModule } from '../mail/mail.module'
import { TokensModule } from '../tokens/tokens.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([RestaurantsRepository]),
    ConfigModule.forFeature(appConfig),
    FilesModule,
    MailModule,
    TokensModule
  ],
  controllers: [RestaurantsController],
  providers: [RestaurantsService],
  exports: [RestaurantsService]
})
export class RestaurantsModule {}
