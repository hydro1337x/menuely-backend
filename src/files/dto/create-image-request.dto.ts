import { IsNotEmpty } from 'class-validator'

export class CreateImageRequestDto {
  @IsNotEmpty()
  name: string

  @IsNotEmpty()
  url: string
}
