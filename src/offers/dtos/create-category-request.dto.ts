import { IsNumber, IsNumberString, IsString, NotEquals } from 'class-validator'
import { Transform } from 'class-transformer'

export class CreateCategoryRequestDto {
  @IsString()
  name: string

  @Transform((data) => parseInt(data.value))
  @IsNumber()
  @NotEquals(0)
  menuId: number
}
