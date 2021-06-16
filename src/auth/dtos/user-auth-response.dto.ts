import { Expose } from 'class-transformer'
import { UserProfileResponseDto } from '../../users/dtos/user-profile-response.dto'
import { TokensResponseDto } from './tokens-response.dto'

export class UserAuthResponseDto {
  user: UserProfileResponseDto

  auth: TokensResponseDto
}
