import { Module } from '@nestjs/common'
import { OffersController } from './offers.controller'
import { OffersService } from './offers.service'
import { QrModule } from '../qr/qr.module'
import { FilesModule } from '../files/files.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MenusRepository } from './repositories/menus.repository'
import { CategoriesRepository } from './repositories/categories.repository'
import { ProductsRepository } from './repositories/products.repository'
import { ConfigModule } from '@nestjs/config'
import appConfig from '../config/app.config'
import { MailModule } from '../mail/mail.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MenusRepository,
      CategoriesRepository,
      ProductsRepository
    ]),
    ConfigModule.forFeature(appConfig),
    QrModule,
    FilesModule,
    MailModule
  ],
  controllers: [OffersController],
  providers: [OffersService],
  exports: [OffersService]
})
export class OffersModule {}
