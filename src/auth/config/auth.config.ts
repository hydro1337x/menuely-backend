import { registerAs } from '@nestjs/config'

export default registerAs('auth', () => ({
  verifyUserUrl: process.env.BASE_URL + '/auth/verify/user',
  verifyRestaurantUrl: process.env.BASE_URL + '/auth/verify/restaurant'
}))
