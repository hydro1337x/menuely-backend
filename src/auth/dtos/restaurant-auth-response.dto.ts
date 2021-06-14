import { Expose } from 'class-transformer'

export class RestaurantAuthResponseDto {
  @Expose()
  id: number

  @Expose()
  email: string

  @Expose()
  name: string

  @Expose()
  country: string

  @Expose()
  city: string

  @Expose()
  address: string

  @Expose()
  postalCode: string

  accessToken: string
}
