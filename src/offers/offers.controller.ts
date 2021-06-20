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
import { ProductResponseDto } from './dtos/product-response.dto'
import { CreateMenuRequestDto } from './dtos/create-menu-request.dto'
import { MenuResponseDto } from './dtos/menu-response.dto'
import { CreateCategoryRequestDto } from './dtos/create-category-request.dto'
import { CategoryResponseDto } from './dtos/category-response.dto'

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post('menus')
  @UseGuards(RestaurantAccessJwtAuthGuard)
  @UsePipes(ValidationPipe)
  @UseInterceptors(FileInterceptor('image'))
  createMenu(
    @Body() createMenuRequestDto: CreateMenuRequestDto,
    @UploadedFile() file: Express.Multer.File
  ): Promise<MenuResponseDto> {
    return this.offersService.createMenu(createMenuRequestDto, file)
  }

  @Post('categories')
  @UseGuards(RestaurantAccessJwtAuthGuard)
  @UsePipes(ValidationPipe)
  @UseInterceptors(FileInterceptor('image'))
  createCategory(
    @Body() createCategoryRequestDto: CreateCategoryRequestDto,
    @UploadedFile() file: Express.Multer.File
  ): Promise<CategoryResponseDto> {
    return this.offersService.createCategory(createCategoryRequestDto, file)
  }

  @Post('products')
  @UseGuards(RestaurantAccessJwtAuthGuard)
  @UsePipes(ValidationPipe)
  @UseInterceptors(FileInterceptor('image'))
  createProduct(
    @Body() createProductRequestDto: CreateProductRequestDto,
    @UploadedFile() file: Express.Multer.File
  ): Promise<ProductResponseDto> {
    return this.offersService.createProduct(createProductRequestDto, file)
  }
}
