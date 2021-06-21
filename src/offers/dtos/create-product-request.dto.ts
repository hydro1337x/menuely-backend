import { IsNumber, IsNumberString, IsString, NotEquals } from 'class-validator'
import { Transform } from 'class-transformer'

export class CreateProductRequestDto {
  @IsString()
  name: string

  @IsString()
  description: string

  @Transform((data) => parseInt(data.value))
  @IsNumber()
  price: number

  @Transform((data) => parseInt(data.value))
  @IsNumber()
  @NotEquals(0)
  categoryId: number
}
