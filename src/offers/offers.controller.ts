import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
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
import { UpdateProductRequestDto } from './dtos/update-product-request.dto'
import { UpdateCategoryRequestDto } from './dtos/update-category-request.dto'
import { UpdateMenuRequestDto } from './dtos/update-menu-request.dto'
import { AuthenticatedEntity } from '../auth/decorators/authenticated-entity.decorator'
import { Restaurant } from '../restaurants/entities/restaurant.entity'

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  /**
   *
   * Menus
   *
   */

  @Get('menus/:id')
  getMenu(@Param('id', ParseIntPipe) id: number): Promise<MenuResponseDto> {
    return this.offersService.getMenu(id)
  }

  @Get('menus')
  getMenus(
    @Query('restaurantId', ParseIntPipe) restaurantId: number
  ): Promise<MenuResponseDto[]> {
    return this.offersService.getMenus(restaurantId)
  }

  @Post('menus')
  @UseGuards(RestaurantAccessJwtAuthGuard)
  @UsePipes(ValidationPipe)
  createMenu(
    @Body() createMenuRequestDto: CreateMenuRequestDto,
    @AuthenticatedEntity() restaurant: Restaurant
  ): Promise<MenuResponseDto> {
    return this.offersService.createMenu(createMenuRequestDto, restaurant)
  }

  @Patch('menus/:id')
  @UseGuards(RestaurantAccessJwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  updateMenu(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMenuRequestDto: UpdateMenuRequestDto,
    @AuthenticatedEntity() restaurant: Restaurant
  ) {
    return this.offersService.updateMenu(id, updateMenuRequestDto, restaurant)
  }

  @Delete('menus/:id')
  @UseGuards(RestaurantAccessJwtAuthGuard)
  deleteMenu(
    @Param('id', ParseIntPipe) id: number,
    @AuthenticatedEntity() restaurant: Restaurant
  ): Promise<void> {
    return this.offersService.deleteMenu(id, restaurant)
  }

  /**
   *
   * Categories
   *
   */

  @Get('categories/:id')
  getCategory(
    @Param('id', ParseIntPipe) id: number
  ): Promise<CategoryResponseDto> {
    return this.offersService.getCategory(id)
  }

  @Get('categories')
  getCategories(
    @Query('menuId', ParseIntPipe) menuId: number
  ): Promise<CategoryResponseDto[]> {
    return this.offersService.getCategories(menuId)
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

  @Patch('categories/:id')
  @UseGuards(RestaurantAccessJwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @UseInterceptors(FileInterceptor('image'))
  updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryRequestDto: UpdateCategoryRequestDto,
    @UploadedFile() file: Express.Multer.File,
    @AuthenticatedEntity() restaurant: Restaurant
  ) {
    return this.offersService.updateCategory(
      id,
      updateCategoryRequestDto,
      file,
      restaurant
    )
  }

  @Delete('categories/:id')
  @UseGuards(RestaurantAccessJwtAuthGuard)
  deleteCategory(
    @Param('id', ParseIntPipe) id: number,
    @AuthenticatedEntity() restaurant: Restaurant
  ): Promise<void> {
    return this.offersService.deleteCategory(id, restaurant)
  }

  /**
   *
   * Products
   *
   */

  @Get('products/:id')
  getProduct(
    @Param('id', ParseIntPipe) id: number
  ): Promise<ProductResponseDto> {
    return this.offersService.getProduct(id)
  }

  @Get('products')
  getProducts(
    @Query('categoryId', ParseIntPipe) categoryId: number
  ): Promise<ProductResponseDto[]> {
    return this.offersService.getProducts(categoryId)
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

  @Patch('products/:id')
  @UseGuards(RestaurantAccessJwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @UseInterceptors(FileInterceptor('image'))
  updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductRequestDto: UpdateProductRequestDto,
    @UploadedFile() file: Express.Multer.File,
    @AuthenticatedEntity() restaurant: Restaurant
  ) {
    return this.offersService.updateProduct(
      id,
      updateProductRequestDto,
      file,
      restaurant
    )
  }

  @Delete('products/:id')
  @UseGuards(RestaurantAccessJwtAuthGuard)
  deleteProduct(
    @Param('id', ParseIntPipe) id: number,
    @AuthenticatedEntity() restaurant: Restaurant
  ): Promise<void> {
    return this.offersService.deleteProduct(id, restaurant)
  }
}
