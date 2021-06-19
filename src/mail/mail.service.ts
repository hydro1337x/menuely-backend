import { Injectable } from '@nestjs/common'
import { ResetPasswordEmailParams } from './interfaces/reset-password-email-params.interface'
import { MailerService } from '@nestjs-modules/mailer'

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

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
}
