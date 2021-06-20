import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe
} from '@nestjs/common'
import { RestaurantAccessJwtAuthGuard } from '../auth/guards/restaurant-access-jwt-auth.guard'
import { CreateProductRequestDto } from './dtos/create-product-request.dto'
import { FileInterceptor } from '@nestjs/platform-express'
import { OffersService } from './offers.service'

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post('products')
  @UseGuards(RestaurantAccessJwtAuthGuard)
  @UsePipes(ValidationPipe)
  @UseInterceptors(FileInterceptor('image'))
  createProduct(
    @Body() createProductRequestDto: CreateProductRequestDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.offersService.createProduct(createProductRequestDto, file)
  }
}
