import { Expose, Type } from 'class-transformer'
import { RestaurantProfileResponseDto } from '../../restaurants/dtos/restaurant-profile-response.dto'
import { UserProfileResponseDto } from '../../users/dtos/user-profile-response.dto'

export class InvitationResponseDto {
  @Expose()
  id: number

  @Expose()
  @Type(() => UserProfileResponseDto)
  employee: UserProfileResponseDto

  @Expose()
  @Type(() => RestaurantProfileResponseDto)
  employer: RestaurantProfileResponseDto
}
