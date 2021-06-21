import {
  BadRequestException,
  ConflictException,
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
    private readonly connection: Connection
  ) {}

  /**
   *
   * Menus
   *
   */

  async createMenu(
    createMenuRequestDto: CreateMenuRequestDto
  ): Promise<MenuResponseDto> {
    const { name, description, currency } = createMenuRequestDto

    const queryRunner = this.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // eslint-disable-next-line no-var
      var menu = this.menusRepository.createMenu({
        name,
        description,
        currency
      })

      await queryRunner.manager.save(menu)
      // In order for the id property to be defined, it is needed to first save the menu in the database
      const imageFileParams = await this.qrService.generateQrCode(
        menu.id.toString()
      )

      // eslint-disable-next-line no-var
      var image = await this.filesService.uploadImage(imageFileParams)

      await queryRunner.manager.save(image)
      menu.qrCodeImage = image
      await queryRunner.manager.save(menu)

      await queryRunner.commitTransaction()
    } catch (error) {
      await queryRunner.rollbackTransaction()

      if (image) {
        await this.filesService.deleteRemoteImage(image.name)
        await this.filesService.removeLocalImage(image)
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

    const categoriesResponseDtos = plainToClass(
      CategoryResponseDto,
      categories,
      {
        excludeExtraneousValues: true
      }
    )

    return categoriesResponseDtos
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
    file: Express.Multer.File
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

  async deleteCategory(id: number): Promise<void> {
    const category = await this.categoriesRepository.findCategory(id)

    if (!category) {
      throw new NotFoundException('Category not found')
    }

    const queryRunner = this.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const products = await this.productsRepository.findProducts(category.id)
      for (const product of products) {
        await this.deleteProduct(product.id)
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

    const productsResponseDtos = plainToClass(ProductResponseDto, products, {
      excludeExtraneousValues: true
    })

    return productsResponseDtos
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
    file: Express.Multer.File
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

  async deleteProduct(id: number): Promise<void> {
    const product = await this.productsRepository.findProduct(id)

    if (!product) {
      throw new NotFoundException('Product not found')
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
}
