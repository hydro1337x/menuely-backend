import { Expose, Transform, Type } from 'class-transformer'
import { OrderedProductResponseDto } from './ordered-product-response.dto'

export class UserOrderResponseDto {
  @Expose()
  id: number

  @Expose()
  totalPrice: number

  @Expose()
  currency: string

  @Expose()
  employerName: string

  @Expose()
  tableId: number

  @Expose()
  employeeName: string

  @Expose()
  @Transform((data) => Math.floor(new Date(data.value).getTime() / 1000))
  createdAt: number

  @Expose()
  @Transform((data) => Math.floor(new Date(data.value).getTime() / 1000))
  updatedAt: number

  @Expose()
  @Type(() => OrderedProductResponseDto)
  orderedProducts: OrderedProductResponseDto[]
}
