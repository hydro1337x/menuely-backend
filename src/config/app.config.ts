import { registerAs } from '@nestjs/config'

export default registerAs('app', () => ({
  baseUrl: process.env.BASE_URL,
  appSecret: process.env.APP_SECRET,
  nodeEnv: process.env.NODE_ENV,
  port: parseInt(process.env.PORT)
}))
