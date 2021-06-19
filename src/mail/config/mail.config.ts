import { registerAs } from '@nestjs/config'

export default registerAs('mail', () => ({
  smtpHost: process.env.SMTP_HOST,
  smtpPort: parseInt(process.env.SMTP_PORT),
  smtpUser: process.env.SMTP_USER,
  smtpUserPassword: process.env.SMTP_USER_PASSWORD,
  mailFrom: process.env.MAIL_FROM
}))
