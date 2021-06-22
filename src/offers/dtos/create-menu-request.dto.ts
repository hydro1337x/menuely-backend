import { IsNumber, IsString, NotEquals } from 'class-validator'

export class CreateMenuRequestDto {
  @IsString()
  name: string

  @IsString()
  description: string

  @IsString()
  currency: string
}
