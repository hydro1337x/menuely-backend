import { IsOptional } from 'class-validator'

export class FilterRestaurantRequestDto {
  @IsOptional()
  search: string
}
