import { registerAs } from '@nestjs/config'

export default registerAs('app', () => ({
  appSecret: process.env.APP_SECRET,
  nodeEnv: process.env.NODE_ENV,
  port: parseInt(process.env.PORT)
}))
