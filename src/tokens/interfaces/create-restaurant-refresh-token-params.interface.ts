import { Restaurant } from '../../restaurants/entities/restaurant.entity'

export interface CreateRestaurantRefreshTokenParams {
  restaurant: Restaurant
  hash: string
}
