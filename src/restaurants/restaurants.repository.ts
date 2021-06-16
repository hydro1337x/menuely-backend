import { EntityRepository, Repository } from 'typeorm'
import { ConflictException, InternalServerErrorException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { Restaurant } from './entities/restaurant.entity'
import { RestaurantRegistrationCredentialsDto } from '../auth/dtos/restaurant-registration-credentials.dto'
import { UniqueSearchCriteria } from '../global/interfaces/unique-search-criteria.interface'
import { email } from '@sideway/address'

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

  async findRestaurant(
    searchCriteria: UniqueSearchCriteria
  ): Promise<Restaurant | undefined> {
    const { id, email } = searchCriteria
    const query = this.createQueryBuilder('restaurant')

    if (id) {
      query.where('restaurant.id = :id', { id: id })
    }

    if (email) {
      query.where('restaurant.email = :email', { email: email })
    }

    const restaurant = await query
      .leftJoinAndSelect('restaurant.refreshTokens', 'refreshToken')
      .getOne()

    return restaurant
  }

  async hashPassword(password: string, salt: string): Promise<string> {
    return await bcrypt.hash(password, salt)
  }
}
