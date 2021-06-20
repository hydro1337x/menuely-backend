import { Module } from '@nestjs/common'
import { MenusController } from './menus.controller'
import { MenusService } from './menus.service'
import { QrModule } from '../qr/qr.module'
import { FilesModule } from '../files/files.module'

@Module({
  imports: [QrModule, FilesModule],
  controllers: [MenusController],
  providers: [MenusService]
})
export class MenusModule {}
