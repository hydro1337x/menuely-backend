import { EntityRepository, Repository } from 'typeorm'
import { ConflictException, InternalServerErrorException } from '@nestjs/common'
import { Restaurant } from './entities/restaurant.entity'
import { UniqueSearchCriteria } from '../global/interfaces/unique-search-criteria.interface'
import { CreateRestaurantParams } from './interfaces/create-restaurant-params.interface'
import { UpdateRestaurantPasswordParams } from './interfaces/update-restaurant-password-params.interface'
import { UpdateRestaurantProfileRequestDto } from './dtos/update-restaurant-profile-request.dto'
import { FilterRestaurantRequestDto } from './dtos/filter-restaurant-request.dto'

@EntityRepository(Restaurant)
export class RestaurantsRepository extends Repository<Restaurant> {
  async createRestaurant(
    createRestaurantParams: CreateRestaurantParams
  ): Promise<void> {
    const {
      email,
      password,
      name,
      description,
      country,
      city,
      address,
      postalCode,
      salt
    } = createRestaurantParams

    const restaurant = new Restaurant()
    restaurant.email = email
    restaurant.passwordSalt = salt
    restaurant.password = password
    restaurant.name = name
    restaurant.description = description
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

  async findRestaurants(
    filterRestaurantRequestDto: FilterRestaurantRequestDto
  ): Promise<Restaurant[]> {
    const { search } = filterRestaurantRequestDto
    const query = this.createQueryBuilder('restaurant')

    if (search) {
      query.where(
        '(restaurant.name LIKE :search OR restaurant.email LIKE :search OR restaurant.country LIKE :search OR restaurant.city LIKE :search OR restaurant.address LIKE :search OR restaurant.postalCode LIKE :search)',
        { search: `%${search}%` }
      )
    }

    const restaurants = await query.getMany()

    return restaurants
  }

  async updateRestaurantProfile(
    updateRestaurantprofileRequestDto: UpdateRestaurantProfileRequestDto,
    restaurant: Restaurant
  ): Promise<void> {
    const {
      name,
      description,
      country,
      city,
      address,
      postalCode,
      profileImageUrl,
      coverImageUrl
    } = updateRestaurantprofileRequestDto

    if (name) {
      restaurant.name = name
    }

    if (description) {
      restaurant.description = description
    }

    if (country) {
      restaurant.country = country
    }

    if (city) {
      restaurant.city = city
    }

    if (address) {
      restaurant.address = address
    }

    if (postalCode) {
      restaurant.postalCode = postalCode
    }

    if (profileImageUrl) {
      restaurant.profileImageUrl = profileImageUrl
    }

    if (coverImageUrl) {
      restaurant.coverImageUrl = coverImageUrl
    }

    try {
      await restaurant.save()
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Failed updating restaurant profile'
      )
    }
  }

  async updateRestaurantPassword(
    updateRestaurantPasswordParams: UpdateRestaurantPasswordParams
  ): Promise<void> {
    const { password, salt, restaurant } = updateRestaurantPasswordParams

    restaurant.passwordSalt = salt
    restaurant.password = password

    try {
      await restaurant.save()
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Failed updating new restaurant password'
      )
    }
  }
}
