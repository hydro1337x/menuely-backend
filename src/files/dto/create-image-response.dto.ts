import { Expose, Transform } from 'class-transformer'

export class CreateImageResponseDto {
  @Expose()
  id: number

  @Expose()
  name: string

  @Expose()
  url: string

  @Expose()
  @Transform((data) => Math.floor(new Date(data.value).getTime() / 1000))
  createdAt: number

  @Expose()
  @Transform((data) => Math.floor(new Date(data.value).getTime() / 1000))
  updatedAt: number
}
