import {
  Body,
  Controller,
  Patch,
  UseGuards,
  UsePipes,
  ValidationPipe
} from '@nestjs/common'
import { AuthenticatedEntity } from '../auth/decorators/authenticated-entity.decorator'
import { UpdateRestaurantPasswordRequestDto } from './dtos/update-restaurant-password-request.dto'
import { Restaurant } from './entities/restaurant.entity'
import { RestaurantAccessJwtAuthGuard } from '../auth/guards/restaurant-access-jwt-auth.guard'
import { RestaurantsService } from './restaurants.service'

@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

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
}
