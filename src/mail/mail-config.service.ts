import { Inject, Injectable } from '@nestjs/common'
import { MailerOptions, MailerOptionsFactory } from '@nestjs-modules/mailer'
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'
import mailConfig from '../mail/config/mail.config'
import { ConfigType } from '@nestjs/config'

@Injectable()
export class MailConfigService implements MailerOptionsFactory {
  constructor(
    @Inject(mailConfig.KEY)
    private readonly mailConfiguration: ConfigType<typeof mailConfig>
  ) {}
  createMailerOptions(): Promise<MailerOptions> | MailerOptions {
    return {
      transport: {
        host: this.mailConfiguration.smtpHost,
        port: this.mailConfiguration.smtpPort,
        secure: false,
        auth: {
          user: this.mailConfiguration.smtpUser,
          pass: this.mailConfiguration.smtpUserPassword
        }
      },
      defaults: {
        from: '"No Reply" <noreply@example.com>'
      },
      template: {
        dir: __dirname + '/templates',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true
        }
      }
    }
  }
}
