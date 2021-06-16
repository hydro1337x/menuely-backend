import { Expose } from 'class-transformer'

export class UserProfileResponseDto {
  @Expose()
  id: number

  @Expose()
  email: string

  @Expose()
  firstname: string

  @Expose()
  lastname: string
}
