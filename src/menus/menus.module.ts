import { Module } from '@nestjs/common'
import { MenusController } from './menus.controller'
import { MenusService } from './menus.service'
import { QrModule } from '../qr/qr.module'
import { FilesModule } from '../files/files.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ImagesRepository } from '../files/images.repository'
import { MenusRepository } from './repositories/menus.repository'
import { CategoriesRepository } from './repositories/categories.repository'
import { ProductsRepository } from './repositories/products.repository'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MenusRepository,
      CategoriesRepository,
      ProductsRepository
    ]),
    QrModule,
    FilesModule
  ],
  controllers: [MenusController],
  providers: [MenusService]
})
export class MenusModule {}
