import { Expose, Transform, Type } from 'class-transformer'

export class OrderedProductResponseDto {
  @Expose()
  id: number

  @Expose()
  name: string

  @Expose()
  orderedProductId: number

  @Expose()
  quantity: number

  @Expose()
  price: number

  @Expose()
  description: string

  @Expose()
  imageUrl: string

  @Expose()
  orderId: number

  @Expose()
  @Transform((data) => Math.floor(new Date(data.value).getTime() / 1000))
  createdAt: number

  @Expose()
  @Transform((data) => Math.floor(new Date(data.value).getTime() / 1000))
  updatedAt: number
}
