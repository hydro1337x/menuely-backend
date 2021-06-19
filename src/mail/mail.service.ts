import { Injectable } from '@nestjs/common'
import { ResetPasswordEmailParams } from './interfaces/reset-password-email-params.interface'
import { MailerService } from '@nestjs-modules/mailer'
import { SendVerificationEmailParams } from './interfaces/send-verification-email-params.interface'

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendResetPassword(resetPasswordEmailParams: ResetPasswordEmailParams) {
    const { email, name, password } = resetPasswordEmailParams

    await this.mailerService.sendMail({
      to: email,
      subject: 'Menuely Support',
      template: './reset-password',
      context: {
        name,
        password
      }
    })
  }

  async sendVerification(
    sendVerificationEmailParams: SendVerificationEmailParams
  ) {
    const { email, name, url } = sendVerificationEmailParams

    await this.mailerService.sendMail({
      to: email,
      subject: 'Menuely Support',
      template: './verification',
      context: {
        name,
        url
      }
    })
  }
}
