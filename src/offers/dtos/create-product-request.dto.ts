import { IsNumber, IsString, NotEquals } from 'class-validator'

export class CreateProductRequestDto {
  @IsString()
  name: string

  @IsString()
  description: string

  @IsNumber()
  price: number

  @IsString()
  currency: string

  @IsNumber()
  @NotEquals(0)
  categoryId: number
}
