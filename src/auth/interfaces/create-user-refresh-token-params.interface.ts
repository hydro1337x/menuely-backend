import { User } from '../../users/entities/user.entity'

export interface CreateUserRefreshTokenParams {
  user: User
  hash: string
}
