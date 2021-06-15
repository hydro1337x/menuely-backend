import { EntityRepository, Repository } from 'typeorm'
import { ConflictException, InternalServerErrorException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { Restaurant } from './entities/restaurant.entity'
import { RestaurantRegistrationCredentialsDto } from '../auth/dtos/restaurant-registration-credentials.dto'

@EntityRepository(Restaurant)
export class RestaurantsRepository extends Repository<Restaurant> {
  async createRestaurant(
    restaurantRegistrationCredentialsDto: RestaurantRegistrationCredentialsDto
  ): Promise<void> {
    const { email, password, name, country, city, address, postalCode } =
      restaurantRegistrationCredentialsDto

    const restaurant = new Restaurant()
    restaurant.email = email
    restaurant.salt = await bcrypt.genSalt()
    restaurant.password = await this.hashPassword(password, restaurant.salt)
    restaurant.name = name
    restaurant.country = country
    restaurant.city = city
    restaurant.address = address
    restaurant.postalCode = postalCode

    try {
      await restaurant.save()
    } catch (error) {
      if (error.code == 23505) {
        throw new ConflictException('Duplicate email')
      } else {
        throw new InternalServerErrorException() // Unexpected error, case not handeled
      }
    }
  }

  async findRestaurant(email: string): Promise<Restaurant | undefined> {
    return await Restaurant.findOne({ email }, { relations: ['refreshTokens'] })
  }

  async hashPassword(password: string, salt: string): Promise<string> {
    return await bcrypt.hash(password, salt)
  }
}
