import { RestaurantProfileResponseDto } from '../../restaurants/dtos/restaurant-profile-response.dto'
import { TokensResponseDto } from './tokens-response.dto'

export class RestaurantAuthResponseDto {
  restaurant: RestaurantProfileResponseDto

  auth: TokensResponseDto
}
