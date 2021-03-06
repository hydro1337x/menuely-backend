import { Injectable } from '@nestjs/common'
import { ResetPasswordEmailParams } from './interfaces/reset-password-email-params.interface'
import { MailerService } from '@nestjs-modules/mailer'
import { SendVerificationEmailParams } from './interfaces/send-verification-email-params.interface'
import { SendQrCodeEmailParams } from './interfaces/send-qr-code-email-params.interface'

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendResetPassword(
    resetPasswordEmailParams: ResetPasswordEmailParams
  ): Promise<void> {
    const { email, name, password } = resetPasswordEmailParams

    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset - Menuely Support',
      template: './reset-password',
      context: {
        name,
        password
      }
    })
  }

  async sendVerification(
    sendVerificationEmailParams: SendVerificationEmailParams
  ): Promise<void> {
    const { email, name, verificationUrl, resendUrl } =
      sendVerificationEmailParams

    await this.mailerService.sendMail({
      to: email,
      subject: 'Email Verification - Menuely Support',
      template: './verification',
      context: {
        name,
        verificationUrl,
        resendUrl
      }
    })
  }

  async sendQrCodes(
    sendQrCodeEmailParams: SendQrCodeEmailParams
  ): Promise<void> {
    const { email, name, menu, urlTableTuples } = sendQrCodeEmailParams

    await this.mailerService.sendMail({
      to: email,
      subject: 'QR Codes - Menuely Support',
      template: './qr-codes',
      context: {
        name,
        menu,
        urlTableTuples: urlTableTuples
      }
    })
  }
}
