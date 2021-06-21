import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'
import { Transform } from 'class-transformer'

export class UpdateProductRequestDto {
  @IsOptional()
  @IsString()
  name: string

  @IsOptional()
  @IsString()
  description: string

  @Transform((data) => parseFloat(data.value))
  @IsOptional()
  @IsNumber()
  price: number
}
