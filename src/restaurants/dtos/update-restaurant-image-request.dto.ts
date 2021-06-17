import { IsIn } from 'class-validator'
import { RestaurantImageKind } from '../enums/restaurant-image-kind.enum'

export class UpdateRestaurantImageRequestDto {
  @IsIn([RestaurantImageKind.PROFILE, RestaurantImageKind.COVER])
  kind: RestaurantImageKind
}
