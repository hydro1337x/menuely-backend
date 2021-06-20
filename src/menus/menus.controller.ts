import { Controller, Get } from '@nestjs/common'
import { QrService } from '../qr/qr.service'
import { FilesService } from '../files/files.service'

@Controller('menus')
export class MenusController {
  constructor(
    private readonly qrService: QrService,
    private readonly filesService: FilesService
  ) {}

  @Get('test')
  async test() {
    const buffer = await this.qrService.generateQrCodeWithBuffer('1')
    const url = await this.filesService.uploadImage({
      name: 'qr.png',
      mime: 'image/png',
      buffer: buffer
    })
  }
}
