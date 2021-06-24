import { Expose, Transform, Type } from 'class-transformer'
import { ImageResponseDto } from '../../files/dto/image-response.dto'

export class ProductResponseDto {
  @Expose()
  id: number

  @Expose()
  name: string

  @Expose()
  description: string

  @Expose()
  price: number

  @Expose()
  currency: string

  @Expose()
  restaurantId: number

  @Expose()
  categoryId: number

  @Expose()
  @Transform((data) => Math.floor(new Date(data.value).getTime() / 1000))
  createdAt: number

  @Expose()
  @Transform((data) => Math.floor(new Date(data.value).getTime() / 1000))
  updatedAt: number

  @Expose()
  @Type(() => ImageResponseDto)
  image: ImageResponseDto
}
