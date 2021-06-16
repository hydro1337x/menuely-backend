import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { RestaurantsRepository } from './restaurants.repository'
import { Restaurant } from './entities/restaurant.entity'
import { RestaurantRegistrationCredentialsDto } from '../auth/dtos/restaurant-registration-credentials.dto'
import { UniqueSearchCriteria } from '../global/interfaces/unique-search-criteria.interface'
import * as bcrypt from 'bcrypt'
import { UpdateRestaurantPasswordRequestDto } from './dtos/update-restaurant-password-request.dto'
import { UpdateRestaurantProfileRequestDto } from './dtos/update-restaurant-profile-request.dto'
import { plainToClass } from 'class-transformer'
import { RestaurantProfileResponseDto } from './dtos/restaurant-profile-response.dto'
import { FilterRestaurantRequestDto } from './dtos/filter-restaurant-request.dto'

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

  async getRestaurant(id: number): Promise<RestaurantProfileResponseDto> {
    const restaurant = await this.findRestaurant({ id })

    if (!restaurant) {
      throw new BadRequestException('Restaurant not found')
    }

    const restaurantProfileResponseDto = plainToClass(
      RestaurantProfileResponseDto,
      restaurant,
      {
        excludeExtraneousValues: true
      }
    )

    return restaurantProfileResponseDto
  }

  async getRestaurants(
    filterRestaurantRequestDto: FilterRestaurantRequestDto
  ): Promise<RestaurantProfileResponseDto[]> {
    const restaurants = await this.restaurantsRepository.findRestaurants(
      filterRestaurantRequestDto
    )

    const restaurantProfileResponseDtos = plainToClass(
      RestaurantProfileResponseDto,
      restaurants,
      {
        excludeExtraneousValues: true
      }
    )

    return restaurantProfileResponseDtos
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

  async updateRestaurantProfile(
    updateRestaurantProfileRequestDto: UpdateRestaurantProfileRequestDto,
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
    } = updateRestaurantProfileRequestDto

    if (
      !name &&
      !description &&
      !country &&
      !city &&
      !address &&
      !postalCode &&
      !profileImageUrl &&
      !coverImageUrl
    ) {
      throw new BadRequestException('At least one field can not be empty')
    }

    return await this.restaurantsRepository.updateRestaurantProfile(
      updateRestaurantProfileRequestDto,
      restaurant
    )
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

  formatRestaurantProfileResponse(
    restaurant: Restaurant
  ): RestaurantProfileResponseDto {
    return plainToClass(RestaurantProfileResponseDto, restaurant, {
      excludeExtraneousValues: true
    })
  }

  async hashPassword(password: string, salt: string): Promise<string> {
    return await bcrypt.hash(password, salt)
  }
}
