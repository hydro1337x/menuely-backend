import { User } from '../entities/user.entity'

export interface UpdateUserPasswordParams {
  password: string
  salt: string
  user: User
}
