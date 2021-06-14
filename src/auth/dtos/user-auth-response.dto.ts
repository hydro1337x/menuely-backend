import { Expose } from 'class-transformer'

export class UserAuthResponseDto {
  @Expose()
  id: number

  @Expose()
  email: string

  @Expose()
  firstname: string

  @Expose()
  lastname: string

  accessToken: string
}
