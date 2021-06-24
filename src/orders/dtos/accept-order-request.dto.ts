import { Transform } from 'class-transformer'
import { IsNumber, NotEquals } from 'class-validator'

export class AcceptOrderRequestDto {
  @Transform((data) => parseInt(data.value))
  @IsNumber()
  @NotEquals(0)
  orderId: number
}
