import { registerAs } from '@nestjs/config'

export default registerAs('app', () => ({
  baseUrl: process.env.BASE_URL,
  appSecret: process.env.APP_SECRET,
  nodeEnv: process.env.NODE_ENV,
  port: parseInt(process.env.PORT),
  verifyUserUrl: process.env.BASE_URL + '/auth/verify/user',
  verifyRestaurantUrl: process.env.BASE_URL + '/auth/verify/restaurant',
  resendUserVerificationUrl:
    process.env.BASE_URL + '/auth/resend-verification/user/',
  resendRestaurantVerificationUrl:
    process.env.BASE_URL + '/auth/resend-verification/restaurant/'
}))
