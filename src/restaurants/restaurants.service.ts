import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException
} from '@nestjs/common'
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
import { UpdateRestaurantImageRequestDto } from './dtos/update-restaurant-image-request.dto'
import { FilesService } from '../files/files.service'
import { RestaurantImageKind } from './enums/restaurant-image-kind.enum'
import { Connection } from 'typeorm'
import { JwtPayload } from '../tokens/interfaces/jwt-payload.interface'
import { JwtSignType } from '../tokens/enums/jwt-sign-type.enum'
import { UpdateRestaurantEmailRequestDto } from './dtos/update-restaurant-email-request.dto'
import { ConfigType } from '@nestjs/config'
import appConfig from '../config/app.config'
import { MailService } from '../mail/mail.service'
import { TokensService } from '../tokens/tokens.service'

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(RestaurantsRepository)
    private readonly restaurantsRepository: RestaurantsRepository,
    private readonly filesService: FilesService,
    private readonly mailService: MailService,
    private readonly tokensService: TokensService,
    private readonly connection: Connection,
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>
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
  ): Promise<Restaurant> {
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
    const { name, description, country, city, address, postalCode } =
      updateRestaurantProfileRequestDto

    if (!name && !description && !country && !city && !address && !postalCode) {
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

  async updateRestaurantEmail(
    updateRestaurantEmailRequestDto: UpdateRestaurantEmailRequestDto,
    restaurant: Restaurant
  ) {
    const { email } = updateRestaurantEmailRequestDto

    restaurant.email = email
    restaurant.isVerified = false

    try {
      await restaurant.save()
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Failed updating restaurant email'
      )
    }

    const payload: JwtPayload = { id: restaurant.id }

    const token = this.tokensService.signToken(
      payload,
      JwtSignType.VERIFICATION
    )

    const base = this.appConfiguration.baseUrl

    const url = new URL(base + '/auth/verify/restaurant')

    url.searchParams.append('token', token)

    await this.mailService.sendVerification({
      email,
      name: restaurant.name,
      url: url.toString()
    })
  }

  async updateRestaurantImage(
    restaurant,
    updateRestaurantImageRequestDto: UpdateRestaurantImageRequestDto,
    file: Express.Multer.File
  ) {
    const { kind } = updateRestaurantImageRequestDto

    const queryRunner = this.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    const imageForDeletion =
      kind === RestaurantImageKind.PROFILE
        ? restaurant.profileImage
        : restaurant.coverImage

    try {
      const image = await this.filesService.uploadImage({
        name: file.originalname,
        mime: file.mimetype,
        buffer: file.buffer
      })

      if (kind === RestaurantImageKind.PROFILE) {
        restaurant.profileImage = image
      }

      if (kind === RestaurantImageKind.COVER) {
        restaurant.coverImage = image
      }

      await queryRunner.manager.save(image)
      await queryRunner.manager.save(restaurant)

      if (imageForDeletion) {
        const imageForDeletionName = imageForDeletion.name
        await queryRunner.manager.remove(imageForDeletion)
        await this.filesService.deleteRemoteImage(imageForDeletionName)
      }

      await queryRunner.commitTransaction()
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw new ConflictException(
        error.message,
        'Failed updating restaurant image'
      )
    } finally {
      await queryRunner.release()
    }
  }

  async deleteRestaurant(restaurant: Restaurant): Promise<void> {
    try {
      await restaurant.remove()
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Failed deleting restaurant'
      )
    }
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
