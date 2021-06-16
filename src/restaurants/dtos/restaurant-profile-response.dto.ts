import { Expose } from 'class-transformer'

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
}
