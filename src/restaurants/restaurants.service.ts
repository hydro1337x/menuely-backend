import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { RestaurantsRepository } from './restaurants.repository'
import { Restaurant } from './entities/restaurant.entity'
import { RestaurantRegistrationCredentialsDto } from '../auth/dtos/restaurant-registration-credentials.dto'

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(RestaurantsRepository)
    private restaurantsRepository: RestaurantsRepository
  ) {}

  async findRestaurant(email: string): Promise<Restaurant | undefined> {
    return await this.restaurantsRepository.findOne({ email })
  }

  async createRestaurant(
    restaurantRegistrationCredentialsDto: RestaurantRegistrationCredentialsDto
  ): Promise<void> {
    return await this.restaurantsRepository.createRestaurant(
      restaurantRegistrationCredentialsDto
    )
  }
}
