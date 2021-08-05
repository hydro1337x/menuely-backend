import { Expose, Transform, Type } from 'class-transformer'
import { ImageResponseDto } from '../../files/dto/image-response.dto'

export class MenuResponseDto {
  @Expose()
  id: number

  @Expose()
  name: string

  @Expose()
  description: string

  @Expose()
  currency: string

  @Expose()
  restaurantId: number

  @Expose()
  isActive: boolean

  @Expose()
  @Transform((data) => Math.floor(new Date(data.value).getTime() / 1000))
  createdAt: number

  @Expose()
  @Transform((data) => Math.floor(new Date(data.value).getTime() / 1000))
  updatedAt: number
}
