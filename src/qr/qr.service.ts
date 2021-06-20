import { Injectable, InternalServerErrorException } from '@nestjs/common'
import * as qr from 'qrcode'
import { v4 as uuid } from 'uuid'
import { ImageFileParams } from '../files/interfaces/upload-file-params.interface'

@Injectable()
export class QrService {
  async generateQrCodeWithBuffer(text: string): Promise<ImageFileParams> {
    let buffer: Buffer
    try {
      buffer = await qr.toBuffer(text, {
        type: 'png',
        width: 500
      })
    } catch (error) {
      throw new InternalServerErrorException(error, 'Failed generating QR code')
    }

    const imageFileParams: ImageFileParams = {
      name: uuid(),
      mime: 'image/png',
      buffer: buffer
    }

    return imageFileParams
  }
}
