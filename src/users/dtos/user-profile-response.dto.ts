import { Expose, Transform, Type } from 'class-transformer'
import { ImageResponseDto } from '../../files/dto/image-response.dto'
import { RestaurantProfileResponseDto } from '../../restaurants/dtos/restaurant-profile-response.dto'
import { ValidateNested } from 'class-validator'

export class UserProfileResponseDto {
  @Expose()
  id: number

  @Expose()
  email: string

  @Expose()
  firstname: string

  @Expose()
  lastname: string

  @Expose()
  @Transform((data) => Math.floor(new Date(data.value).getTime() / 1000))
  createdAt: number

  @Expose()
  @Transform((data) => Math.floor(new Date(data.value).getTime() / 1000))
  updatedAt: number

  @Expose()
  @Type(() => RestaurantProfileResponseDto)
  employer: RestaurantProfileResponseDto

  @Expose()
  @Type(() => ImageResponseDto)
  profileImage: ImageResponseDto

  @Expose()
  @Type(() => ImageResponseDto)
  coverImage: ImageResponseDto
}
