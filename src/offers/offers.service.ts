import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { CreateProductRequestDto } from './dtos/create-product-request.dto'
import { QrService } from '../qr/qr.service'
import { FilesService } from '../files/files.service'
import { InjectRepository } from '@nestjs/typeorm'
import { MenusRepository } from './repositories/menus.repository'
import { CategoriesRepository } from './repositories/categories.repository'
import { ProductsRepository } from './repositories/products.repository'
import { Connection } from 'typeorm'
import { plainToClass } from 'class-transformer'
import { ProductResponseDto } from './dtos/product-response.dto'
import { CreateMenuRequestDto } from './dtos/create-menu-request.dto'
import { MenuResponseDto } from './dtos/menu-response.dto'
import { CreateCategoryRequestDto } from './dtos/create-category-request.dto'
import { CategoryResponseDto } from './dtos/category-response.dto'
import { UpdateProductRequestDto } from './dtos/update-product-request.dto'
import { UpdateCategoryRequestDto } from './dtos/update-category-request.dto'
import { UpdateMenuRequestDto } from './dtos/update-menu-request.dto'
import { Product } from './entities/product.entity'
import { Restaurant } from '../restaurants/entities/restaurant.entity'
import { Menu } from './entities/menu.entity'
import appConfig from '../config/app.config'
import { ConfigType } from '@nestjs/config'
import { Image } from '../files/entities/image.entity'
import { UrlTableTuple } from '../mail/interfaces/url-table-tuple.interface'
import { MailService } from '../mail/mail.service'

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(MenusRepository)
    private readonly menusRepository: MenusRepository,
    @InjectRepository(CategoriesRepository)
    private readonly categoriesRepository: CategoriesRepository,
    @InjectRepository(ProductsRepository)
    private readonly productsRepository: ProductsRepository,
    private readonly qrService: QrService,
    private readonly filesService: FilesService,
    private readonly mailService: MailService,
    private readonly connection: Connection,
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>
  ) {}

  /**
   *
   * Menus
   *
   */

  async getMenu(id: number): Promise<MenuResponseDto> {
    const menu = await this.menusRepository.findMenu(id)

    if (!menu) {
      throw new NotFoundException('Menu not found')
    }

    const menuResponseDto = plainToClass(MenuResponseDto, menu, {
      excludeExtraneousValues: true
    })

    return menuResponseDto
  }

  async getMenus(restaurantId: number): Promise<MenuResponseDto[]> {
    const menus = await this.menusRepository.findMenus(restaurantId)

    const menuResponseDtos = plainToClass(MenuResponseDto, menus, {
      excludeExtraneousValues: true
    })

    return menuResponseDtos
  }

  async createMenu(
    createMenuRequestDto: CreateMenuRequestDto,
    restaurant: Restaurant
  ): Promise<MenuResponseDto> {
    const { name, description, currency, numberOfTables } = createMenuRequestDto

    if (numberOfTables > 25) {
      throw new BadRequestException(
        'CreateMenuRequestDto',
        'Amount of specified tables is not supported'
      )
    }

    const queryRunner = this.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // eslint-disable-next-line no-var
      var menu = this.menusRepository.createMenu({
        name,
        description,
        currency,
        restaurantId: restaurant.id
      })

      // In order for the id property to be defined, it is needed to first save the menu in the database
      await queryRunner.manager.save(menu)

      // eslint-disable-next-line no-var
      var qrCodeImages: Image[] = []
      var urlTableTuples: UrlTableTuple[] = []
      const baseUrl = this.appConfiguration.baseUrl

      for (let tableNumber = 1; tableNumber <= numberOfTables; tableNumber++) {
        const imageFileParams = await this.qrService.generateQrCode(
          this.formatQrCodePayload(baseUrl, menu.id, tableNumber)
        )

        const qrCodeImage = await this.filesService.uploadImage(imageFileParams)

        urlTableTuples.push({
          url: qrCodeImage.url,
          tableId: tableNumber.toString()
        })

        qrCodeImages.push(qrCodeImage)
      }

      await queryRunner.manager.save(qrCodeImages)
      menu.qrCodeImages = qrCodeImages
      await queryRunner.manager.save(menu)

      await this.mailService.sendQrCodes({
        name: restaurant.name,
        menu: menu.name,
        email: restaurant.email,
        urlTableTuples: urlTableTuples
      })

      await queryRunner.commitTransaction()
    } catch (error) {
      await queryRunner.rollbackTransaction()

      if (qrCodeImages.length > 0) {
        await this.filesService.deleteRemoteImages(
          qrCodeImages.map((qrCodeImage) => {
            return qrCodeImage.name
          })
        )
        await this.filesService.removeLocalImages(qrCodeImages)
      }

      throw new ConflictException(error.message, 'Failed creating menu')
    } finally {
      await queryRunner.release()
    }

    const menuResponseDto = plainToClass(MenuResponseDto, menu, {
      excludeExtraneousValues: true
    })

    return menuResponseDto
  }

  async updateMenu(
    id: number,
    updateMenuRequestDto: UpdateMenuRequestDto,
    restaurant: Restaurant
  ): Promise<void> {
    const { name, description, currency, isActive } = updateMenuRequestDto

    if (!name && !description && !currency && !isActive) {
      throw new BadRequestException(
        'UpdateMenuRequestDto',
        'At least one field needs to be provided'
      )
    }

    const menu = await this.menusRepository.findMenu(id)

    if (!menu) {
      throw new NotFoundException(
        'UpdateMenuRequestDto',
        'Menu for updating not found'
      )
    }

    if (menu.restaurantId !== restaurant.id) {
      throw new ForbiddenException('UpdateMenuRequestDto', 'Resource not owned')
    }

    const queryRunner = this.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      if (name) {
        menu.name = name
      }

      if (description) {
        menu.description = description
      }

      if (isActive) {
        const menus = await this.menusRepository.findMenus(restaurant.id)

        for (const menu of menus) {
          menu.isActive = false
        }

        await queryRunner.manager.save(menus)

        menu.isActive = isActive
      }

      if (currency) {
        menu.currency = currency
        const categories = await this.categoriesRepository.findCategories(
          menu.id
        )

        const products: Product[] = []

        for (const category of categories) {
          category.currency = currency
          const categoryProducts: Product[] =
            await this.productsRepository.findProducts(category.id)

          products.push(...categoryProducts)
        }

        products.forEach((product) => {
          product.currency = currency
        })

        await queryRunner.manager.save(products)
        await queryRunner.manager.save(categories)
      }

      await queryRunner.manager.save(menu)

      await queryRunner.commitTransaction()
    } catch (error) {
      await queryRunner.rollbackTransaction()

      throw new ConflictException(error.message, 'Failed updating menu')
    } finally {
      await queryRunner.release()
    }
  }

  async deleteMenu(id: number, restaurant: Restaurant): Promise<void> {
    const menu = await this.menusRepository.findMenu(id)

    if (!menu) {
      throw new NotFoundException('Menu not found')
    }

    if (menu.restaurantId !== restaurant.id) {
      throw new ForbiddenException('DeleteMenu', 'Resource not owned')
    }

    const queryRunner = this.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const categories = await this.categoriesRepository.findCategories(menu.id)
      for (const category of categories) {
        await this.deleteCategory(category.id, restaurant)
      }

      const qrCodeImages = menu.qrCodeImages
      await this.filesService.deleteRemoteImages(
        qrCodeImages.map((qrCodeImage) => {
          return qrCodeImage.name
        })
      )
      await this.filesService.removeLocalImages(qrCodeImages)
      await this.menusRepository.remove(menu)

      await queryRunner.commitTransaction()
    } catch (error) {
      await queryRunner.rollbackTransaction()

      throw new ConflictException(error.message, 'Failed deleting menu')
    } finally {
      await queryRunner.release()
    }
  }

  /**
   *
   * Categories
   *
   */

  async getCategory(id: number): Promise<CategoryResponseDto> {
    const category = await this.categoriesRepository.findCategory(id)

    if (!category) {
      throw new NotFoundException('Category not found')
    }

    const categoryResponseDto = plainToClass(CategoryResponseDto, category, {
      excludeExtraneousValues: true
    })

    return categoryResponseDto
  }

  async getCategories(menuId: number): Promise<CategoryResponseDto[]> {
    const categories = await this.categoriesRepository.findCategories(menuId)

    const categoryResponseDtos = plainToClass(CategoryResponseDto, categories, {
      excludeExtraneousValues: true
    })

    return categoryResponseDtos
  }

  async createCategory(
    createCategoryRequestDto: CreateCategoryRequestDto,
    file: Express.Multer.File
  ): Promise<CategoryResponseDto> {
    if (!file) {
      throw new BadRequestException('Image file can not be empty')
    }

    const { name, menuId } = createCategoryRequestDto

    const menu = await this.menusRepository.findOne(menuId)

    if (!menuId) {
      throw new NotFoundException('Menu not found')
    }

    const queryRunner = this.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // eslint-disable-next-line no-var
      var image = await this.filesService.uploadImage({
        name: file.originalname,
        mime: file.mimetype,
        buffer: file.buffer
      })

      // eslint-disable-next-line no-var
      var category = this.categoriesRepository.createCategory({
        name,
        menu,
        image
      })

      await queryRunner.manager.save(image)
      await queryRunner.manager.save(category)

      await queryRunner.commitTransaction()
    } catch (error) {
      await queryRunner.rollbackTransaction()

      if (image) {
        await this.filesService.deleteRemoteImage(image.name)
        await this.filesService.removeLocalImage(image)
      }

      throw new ConflictException(error.message, 'Failed creating category')
    } finally {
      await queryRunner.release()
    }

    const categoryResponseDto = plainToClass(CategoryResponseDto, category, {
      excludeExtraneousValues: true
    })

    return categoryResponseDto
  }

  async updateCategory(
    id: number,
    updateCategoryRequestDto: UpdateCategoryRequestDto,
    file: Express.Multer.File,
    restaurant: Restaurant
  ): Promise<void> {
    const { name } = updateCategoryRequestDto

    if (!name && !file) {
      throw new BadRequestException(
        'UpdateCategoryRequestDto',
        'At least one field needs to be provided'
      )
    }

    const category = await this.categoriesRepository.findCategory(id)

    if (!category) {
      throw new NotFoundException(
        'UpdateCategoryRequestDto',
        'Category for updating not found'
      )
    }

    if (category.restaurantId !== restaurant.id) {
      throw new ForbiddenException(
        'UpdateCategoryRequestDto',
        'Resource not owned'
      )
    }

    const imageForDeletion = category.image

    const queryRunner = this.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      if (file) {
        // eslint-disable-next-line no-var
        var image = await this.filesService.uploadImage({
          name: file.originalname,
          mime: file.mimetype,
          buffer: file.buffer
        })
      }

      if (name) {
        category.name = name
      }

      if (image) {
        await queryRunner.manager.save(image)
        category.image = image
      }

      await queryRunner.manager.save(category)

      // A new image is added so the previous can be deleted
      if (imageForDeletion && image) {
        const imageForDeletionName = imageForDeletion.name
        await queryRunner.manager.remove(imageForDeletion)
        await this.filesService.deleteRemoteImage(imageForDeletionName)
      }

      await queryRunner.commitTransaction()
    } catch (error) {
      await queryRunner.rollbackTransaction()

      if (image) {
        await this.filesService.deleteRemoteImage(image.name)
        await this.filesService.removeLocalImage(image)
      }

      throw new ConflictException(error.message, 'Failed updating category')
    } finally {
      await queryRunner.release()
    }
  }

  async deleteCategory(id: number, restaurant: Restaurant): Promise<void> {
    const category = await this.categoriesRepository.findCategory(id)

    if (!category) {
      throw new NotFoundException('Category not found')
    }

    if (category.restaurantId !== restaurant.id) {
      throw new ForbiddenException('DeleteCategory', 'Resource not owned')
    }

    const queryRunner = this.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const products = await this.productsRepository.findProducts(category.id)
      for (const product of products) {
        await this.deleteProduct(product.id, restaurant)
      }
      const { name } = category.image
      await this.categoriesRepository.remove(category)
      await this.filesService.removeLocalImage(category.image)
      await this.filesService.deleteRemoteImage(name)

      await queryRunner.commitTransaction()
    } catch (error) {
      await queryRunner.rollbackTransaction()

      throw new ConflictException(error.message, 'Failed deleting category')
    } finally {
      await queryRunner.release()
    }
  }

  /**
   *
   * Products
   *
   */

  async getProduct(id: number): Promise<ProductResponseDto> {
    const product = await this.productsRepository.findProduct(id)

    if (!product) {
      throw new NotFoundException('Product not found')
    }

    const productResponseDto = plainToClass(ProductResponseDto, product, {
      excludeExtraneousValues: true
    })

    return productResponseDto
  }

  async getProducts(categoryId: number): Promise<ProductResponseDto[]> {
    const products = await this.productsRepository.findProducts(categoryId)

    const productResponseDtos = plainToClass(ProductResponseDto, products, {
      excludeExtraneousValues: true
    })

    return productResponseDtos
  }

  async createProduct(
    createProductRequestDto: CreateProductRequestDto,
    file: Express.Multer.File
  ): Promise<ProductResponseDto> {
    if (!file) {
      throw new BadRequestException('Image file can not be empty')
    }

    const { name, description, price, categoryId } = createProductRequestDto

    const category = await this.categoriesRepository.findOne(categoryId)

    if (!category) {
      throw new NotFoundException('Category not found')
    }

    const queryRunner = this.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // eslint-disable-next-line no-var
      var image = await this.filesService.uploadImage({
        name: file.originalname,
        mime: file.mimetype,
        buffer: file.buffer
      })

      // eslint-disable-next-line no-var
      var product = this.productsRepository.createProduct({
        name,
        description,
        price,
        currency: category.currency,
        category,
        image
      })

      await queryRunner.manager.save(image)
      await queryRunner.manager.save(product)

      await queryRunner.commitTransaction()
    } catch (error) {
      await queryRunner.rollbackTransaction()

      if (image) {
        await this.filesService.deleteRemoteImage(image.name)
        await this.filesService.removeLocalImage(image)
      }

      throw new ConflictException(error.message, 'Failed creating product')
    } finally {
      await queryRunner.release()
    }

    const productResponseDto = plainToClass(ProductResponseDto, product, {
      excludeExtraneousValues: true
    })

    return productResponseDto
  }

  async updateProduct(
    id: number,
    updateProductRequestDto: UpdateProductRequestDto,
    file: Express.Multer.File,
    restaurant: Restaurant
  ): Promise<void> {
    const { name, description, price } = updateProductRequestDto

    if (!name && !description && !price && !file) {
      throw new BadRequestException(
        'UpdateProductRequestDto',
        'At least one field needs to be provided'
      )
    }

    const product = await this.productsRepository.findProduct(id)

    if (!product) {
      throw new NotFoundException(
        'UpdateProductRequestDto',
        'Product for updating not found'
      )
    }

    if (product.restaurantId !== restaurant.id) {
      throw new ForbiddenException(
        'UpdateProductRequestDto',
        'Resource not owned'
      )
    }

    const imageForDeletion = product.image

    const queryRunner = this.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      if (file) {
        // eslint-disable-next-line no-var
        var image = await this.filesService.uploadImage({
          name: file.originalname,
          mime: file.mimetype,
          buffer: file.buffer
        })
      }

      if (name) {
        product.name = name
      }

      if (description) {
        product.description = description
      }

      if (price) {
        product.price = price
      }

      if (image) {
        await queryRunner.manager.save(image)
        product.image = image
      }

      await queryRunner.manager.save(product)

      if (imageForDeletion && image) {
        const imageForDeletionName = imageForDeletion.name
        await queryRunner.manager.remove(imageForDeletion)
        await this.filesService.deleteRemoteImage(imageForDeletionName)
      }

      await queryRunner.commitTransaction()
    } catch (error) {
      await queryRunner.rollbackTransaction()

      if (image) {
        await this.filesService.deleteRemoteImage(image.name)
        await this.filesService.removeLocalImage(image)
      }

      throw new ConflictException(error.message, 'Failed updating product')
    } finally {
      await queryRunner.release()
    }
  }

  async deleteProduct(id: number, restaurant: Restaurant): Promise<void> {
    const product = await this.productsRepository.findProduct(id)

    if (!product) {
      throw new NotFoundException('Product not found')
    }

    if (product.restaurantId !== restaurant.id) {
      throw new ForbiddenException('DeleteProduct', 'Resource not owned')
    }

    const queryRunner = this.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const { name } = product.image
      await this.productsRepository.remove(product)
      await this.filesService.removeLocalImage(product.image)
      await this.filesService.deleteRemoteImage(name)

      await queryRunner.commitTransaction()
    } catch (error) {
      await queryRunner.rollbackTransaction()

      throw new ConflictException(error.message, 'Failed deleting product')
    } finally {
      await queryRunner.release()
    }
  }

  async findMenus(restaurantId: number): Promise<Menu[]> {
    return await this.menusRepository.findMenus(restaurantId)
  }

  async findProduct(id: number): Promise<Product> {
    return await this.productsRepository.findProduct(id)
  }

  /**
   *
   * Helpers
   *
   */

  formatQrCodePayload(
    baseUrl: string,
    menuId: number,
    tableId: number
  ): string {
    const url = new URL(baseUrl)
    url.searchParams.append('menuId', menuId.toString())
    url.searchParams.append('tableId', tableId.toString())

    return url.toString()
  }
}
