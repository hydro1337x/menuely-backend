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

  @Patch('me/update/profile')
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

  @Patch('me/update/password')
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

  @Patch('me/update/image')
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

  @Delete('me')
  @UseGuards(RestaurantAccessJwtAuthGuard)
  deleteRestaurant(
    @AuthenticatedEntity() restaurant: Restaurant
  ): Promise<void> {
    return this.restaurantsService.deleteRestaurant(restaurant)
  }
}
