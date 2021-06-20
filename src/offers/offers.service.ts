import {
  Body,
  ConflictException,
  Injectable,
  NotFoundException,
  UploadedFile
} from '@nestjs/common'
import { CreateProductRequestDto } from './dtos/create-product-request.dto'
import { QrService } from '../qr/qr.service'
import { FilesService } from '../files/files.service'
import { InjectRepository } from '@nestjs/typeorm'
import { MenusRepository } from './repositories/menus.repository'
import { CategoriesRepository } from './repositories/categories.repository'
import { ProductsRepository } from './repositories/products.repository'
import { Connection } from 'typeorm'
import { Image } from '../files/entities/image.entity'
import { Product } from './entities/product.entity'
import { plainToClass } from 'class-transformer'
import { ProductResponseDto } from './dtos/product-response.dto'

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

  async createProduct(
    @Body() createProductRequestDto: CreateProductRequestDto,
    @UploadedFile() file: Express.Multer.File
  ): Promise<ProductResponseDto> {
    const { name, description, price, currency, categoryId } =
      createProductRequestDto

    const category = await this.categoriesRepository.findOne(categoryId)

    if (!category) {
      throw new NotFoundException('Category not found')
    }

    const queryRunner = this.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    let image: Image
    let product: Product

    try {
      image = await this.filesService.uploadImage({
        name: file.originalname,
        mime: file.mimetype,
        buffer: file.buffer
      })

      product = this.productsRepository.createProduct({
        name,
        description,
        price,
        currency,
        category,
        image
      })

      await queryRunner.manager.save(image)
      await queryRunner.manager.save(product)

      await queryRunner.commitTransaction()
    } catch (error) {
      await queryRunner.rollbackTransaction()

      await this.filesService.removeLocalImage(image)
      await this.filesService.deleteRemoteImage(image.name)

      throw new ConflictException(
        error.message,
        'Failed updating restaurant image'
      )
    } finally {
      await queryRunner.release()
    }

    const productResponseDto = plainToClass(ProductResponseDto, product, {
      excludeExtraneousValues: true
    })

    return productResponseDto
  }
}
