import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { RestaurantsRepository } from './restaurants.repository'
import { Restaurant } from './entities/restaurant.entity'
import { RestaurantRegistrationCredentialsDto } from '../auth/dtos/restaurant-registration-credentials.dto'
import { UniqueSearchCriteria } from '../global/interfaces/unique-search-criteria.interface'
import * as bcrypt from 'bcrypt'
import { UpdateRestaurantPasswordRequestDto } from './dtos/update-restaurant-password-request.dto'

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(RestaurantsRepository)
    private restaurantsRepository: RestaurantsRepository
  ) {}

  async findRestaurant(
    searchCriteria: UniqueSearchCriteria
  ): Promise<Restaurant | undefined> {
    return await this.restaurantsRepository.findRestaurant(searchCriteria)
  }

  async createRestaurant(
    restaurantRegistrationCredentialsDto: RestaurantRegistrationCredentialsDto
  ): Promise<void> {
    const { password, ...result } = restaurantRegistrationCredentialsDto

    const salt = await bcrypt.genSalt()

    const hashedPassword = await this.hashPassword(password, salt)

    return await this.restaurantsRepository.createRestaurant({
      password: hashedPassword,
      salt,
      ...result
    })
  }

  async updateRestaurantPassword(
    updateRestaurantPasswordRequestDto: UpdateRestaurantPasswordRequestDto,
    restaurant: Restaurant
  ): Promise<void> {
    const { oldPassword, newPassword, repeatedNewPassword } =
      updateRestaurantPasswordRequestDto

    const isOldPasswordValid = await bcrypt.compare(
      oldPassword,
      restaurant.password
    )

    if (!isOldPasswordValid) {
      throw new BadRequestException('Wrong old password')
    }

    if (newPassword !== repeatedNewPassword) {
      throw new BadRequestException('Passwords do not match')
    }

    const salt = await bcrypt.genSalt()

    const hashedPassword = await this.hashPassword(newPassword, salt)

    return await this.restaurantsRepository.updateRestaurantPassword({
      password: hashedPassword,
      salt,
      restaurant
    })
  }

  async hashPassword(password: string, salt: string): Promise<string> {
    return await bcrypt.hash(password, salt)
  }
}
