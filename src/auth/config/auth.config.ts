import { registerAs } from '@nestjs/config'

export default registerAs('auth', () => ({
  refreshTokenSalt: process.env.REFRESH_TOKEN_SALT,
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  accessTokenExpiration: parseInt(process.env.ACCESS_TOKEN_EXPIRATION),
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  refreshTokenExpiration: parseInt(process.env.REFRESH_TOKEN_EXPIRATION),
  verificationTokenSecret: process.env.VERIFICATION_TOKEN_SECRET,
  verificationTokenExpiration: parseInt(
    process.env.VERIFICATION_TOKEN_EXPIRATION
  )
}))
