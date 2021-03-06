import { Expose, Transform, Type } from 'class-transformer'
import { ImageResponseDto } from '../../files/dto/image-response.dto'
import { UserProfileResponseDto } from '../../users/dtos/user-profile-response.dto'
import { ValidateNested } from 'class-validator'

export class RestaurantProfileResponseDto {
  @Expose()
  id: number

  @Expose()
  email: string

  @Expose()
  name: string

  @Expose()
  description: string

  @Expose()
  country: string

  @Expose()
  city: string

  @Expose()
  address: string

  @Expose()
  postalCode: string

  @Expose()
  activeMenuId: number

  @Expose()
  @Transform((data) => Math.floor(new Date(data.value).getTime() / 1000))
  createdAt: number

  @Expose()
  @Transform((data) => Math.floor(new Date(data.value).getTime() / 1000))
  updatedAt: number

  @Expose()
  @Type(() => UserProfileResponseDto)
  employees: UserProfileResponseDto

  @Expose()
  @Type(() => ImageResponseDto)
  profileImage: ImageResponseDto

  @Expose()
  @Type(() => ImageResponseDto)
  coverImage: ImageResponseDto
}
