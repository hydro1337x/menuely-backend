import { Restaurant } from '../entities/restaurant.entity'

export interface UpdateRestaurantPasswordParams {
  password: string
  salt: string
  restaurant: Restaurant
}
