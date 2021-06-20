import { Injectable, InternalServerErrorException } from '@nestjs/common'
import * as qr from 'qrcode'

@Injectable()
export class QrService {
  async generateQrCodeWithBuffer(text: string) {
    try {
      return await qr.toBuffer(text, {
        type: 'png',
        width: 500
      })
    } catch (error) {
      throw new InternalServerErrorException(error, 'Failed generating QR code')
    }
  }
}
