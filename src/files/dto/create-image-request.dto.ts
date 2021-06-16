import { IsNotEmpty } from 'class-validator'

export class CreateImageRequestDto {
  name: string

  url: string
}
