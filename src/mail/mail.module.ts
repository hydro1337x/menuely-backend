import { Module } from '@nestjs/common'
import { MailService } from './mail.service'
import { MailerModule } from '@nestjs-modules/mailer'
import { ConfigModule } from '@nestjs/config'
import mailConfig from '../mail/config/mail.config'
import { MailConfigService } from './mail-config.service'

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule.forFeature(mailConfig)],
      useClass: MailConfigService
    })
  ],
  providers: [MailService],
  exports: [MailService]
})
export class MailModule {}
