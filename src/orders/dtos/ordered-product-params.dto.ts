import { Transform } from 'class-transformer'
import { IsNumber, NotEquals } from 'class-validator'

export class OrderedProductParamsDto {
  @Transform((data) => parseInt(data.value))
  @IsNumber()
  @NotEquals(0)
  orderedProductId: number

  @Transform((data) => parseInt(data.value))
  @IsNumber()
  @NotEquals(0)
  quantity: number

  @Transform((data) => parseFloat(data.value))
  @IsNumber()
  @NotEquals(0)
  price: number
}
