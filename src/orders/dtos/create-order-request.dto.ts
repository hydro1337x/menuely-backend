import { OrderedProductParamsDto } from './ordered-product-params.dto'
import { Transform, Type } from 'class-transformer'
import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  NotEquals,
  ValidateNested
} from 'class-validator'

export class CreateOrderRequestDto {
  @Transform((data) => parseInt(data.value))
  @IsNumber()
  @NotEquals(0)
  restaurantId: number

  @Transform((data) => parseInt(data.value))
  @IsNumber()
  @NotEquals(0)
  tableId: number

  @Transform((data) => parseFloat(data.value))
  @IsNumber()
  @NotEquals(0)
  totalPrice: number

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => OrderedProductParamsDto)
  orderedProducts: [OrderedProductParamsDto]
}
