import { IsNotEmpty, IsOptional } from 'class-validator'

export class UpdateRestaurantProfileRequestDto {
  @IsOptional()
  @IsNotEmpty()
  name: string

  @IsOptional()
  @IsNotEmpty()
  description: string

  @IsOptional()
  @IsNotEmpty()
  country: string

  @IsOptional()
  @IsNotEmpty()
  city: string

  @IsOptional()
  @IsNotEmpty()
  address: string

  @IsOptional()
  @IsNotEmpty()
  postalCode: string
}
