import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe
} from '@nestjs/common'
import { AuthenticatedEntity } from '../auth/decorators/authenticated-entity.decorator'
import { UpdateRestaurantPasswordRequestDto } from './dtos/update-restaurant-password-request.dto'
import { Restaurant } from './entities/restaurant.entity'
import { RestaurantAccessJwtAuthGuard } from '../auth/guards/restaurant-access-jwt-auth.guard'
import { RestaurantsService } from './restaurants.service'
import { UpdateRestaurantProfileRequestDto } from './dtos/update-restaurant-profile-request.dto'
import { FilterRestaurantRequestDto } from './dtos/filter-restaurant-request.dto'
import { RestaurantProfileResponseDto } from './dtos/restaurant-profile-response.dto'
import { FileInterceptor } from '@nestjs/platform-express'
import { UpdateRestaurantImageRequestDto } from './dtos/update-restaurant-image-request.dto'
import { UpdateRestaurantEmailRequestDto } from './dtos/update-restaurant-email-request.dto'
import { UserProfileResponseDto } from '../users/dtos/user-profile-response.dto'
import { FireEmployeeRequestDto } from './dtos/fire-employee-request.dto'

@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Get('me')
  @UseGuards(RestaurantAccessJwtAuthGuard)
  getAuthenticatedRestaurantProfile(
    @AuthenticatedEntity() restaurant: Restaurant
  ): RestaurantProfileResponseDto {
    return this.restaurantsService.formatRestaurantProfileResponse(restaurant)
  }

  @Get(':id')
  getRestaurant(
    @Param('id', ParseIntPipe) id: number
  ): Promise<RestaurantProfileResponseDto> {
    return this.restaurantsService.getRestaurant(id)
  }

  @Get()
  getRestaurants(
    @Query(ValidationPipe)
    filterRestaurantRequestDto: FilterRestaurantRequestDto
  ): Promise<RestaurantProfileResponseDto[]> {
    return this.restaurantsService.getRestaurants(filterRestaurantRequestDto)
  }

  @Get('me/employees')
  @UseGuards(RestaurantAccessJwtAuthGuard)
  getEmployees(
    @AuthenticatedEntity() restaurant: Restaurant
  ): Promise<UserProfileResponseDto[]> {
    return this.restaurantsService.getEmployees(restaurant)
  }

  @Patch('me/profile')
  @UseGuards(RestaurantAccessJwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  updateRestaurantProfile(
    @Body()
    updateRestaurantProfileRequestDto: UpdateRestaurantProfileRequestDto,
    @AuthenticatedEntity() restaurant: Restaurant
  ): Promise<void> {
    return this.restaurantsService.updateRestaurantProfile(
      updateRestaurantProfileRequestDto,
      restaurant
    )
  }

  @Patch('me/password')
  @UseGuards(RestaurantAccessJwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  updateRestaurantPassword(
    @Body()
    updateRestaurantPasswordRequestDto: UpdateRestaurantPasswordRequestDto,
    @AuthenticatedEntity() restaurant: Restaurant
  ): Promise<void> {
    return this.restaurantsService.updateRestaurantPassword(
      updateRestaurantPasswordRequestDto,
      restaurant
    )
  }

  @Patch('me/email')
  @UseGuards(RestaurantAccessJwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  updateRestaurantEmail(
    @Body() updateRestaurantEmailRequestDto: UpdateRestaurantEmailRequestDto,
    @AuthenticatedEntity() restaurant: Restaurant
  ) {
    return this.restaurantsService.updateRestaurantEmail(
      updateRestaurantEmailRequestDto,
      restaurant
    )
  }

  @Patch('me/image')
  @UseGuards(RestaurantAccessJwtAuthGuard)
  @UsePipes(ValidationPipe)
  @UseInterceptors(FileInterceptor('image'))
  updateRestaurantImage(
    @AuthenticatedEntity() restaurant: Restaurant,
    @Body() updateRestaurantImageRequestDto: UpdateRestaurantImageRequestDto,
    @UploadedFile() file: Express.Multer.File
  ): Promise<void> {
    return this.restaurantsService.updateRestaurantImage(
      restaurant,
      updateRestaurantImageRequestDto,
      file
    )
  }

  @Patch('me/fire-employee')
  @UseGuards(RestaurantAccessJwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  fireEmployee(
    @Body() fireEmployeeRequestDto: FireEmployeeRequestDto,
    @AuthenticatedEntity() restaurant: Restaurant
  ) {
    return this.restaurantsService.fireEmployee(
      fireEmployeeRequestDto,
      restaurant
    )
  }

  @Delete('me')
  @UseGuards(RestaurantAccessJwtAuthGuard)
  deleteRestaurant(
    @AuthenticatedEntity() restaurant: Restaurant
  ): Promise<void> {
    return this.restaurantsService.deleteRestaurant(restaurant)
  }
}
