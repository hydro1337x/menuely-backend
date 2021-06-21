import { IsNumber, IsString, NotEquals } from 'class-validator'
import { Transform } from 'class-transformer'

export class CreateMenuRequestDto {
  @IsString()
  name: string

  @IsString()
  description: string

  @IsString()
  currency: string

  @Transform((data) => parseInt(data.value))
  @IsNumber()
  @NotEquals(0)
  restaurantId: number
}
