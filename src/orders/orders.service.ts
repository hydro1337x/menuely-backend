import {
  BadRequestException,
  ConflictException,
  Injectable
} from '@nestjs/common'
import { CreateOrderRequestDto } from './dtos/create-order-request.dto'
import { UsersService } from '../users/users.service'
import { RestaurantsService } from '../restaurants/restaurants.service'
import { InjectRepository } from '@nestjs/typeorm'
import { OrdersRepository } from './repositories/orders.repository'
import { OrderedProductsRepository } from './repositories/ordered-products.repository'
import { Connection } from 'typeorm'
import { Image } from '../files/entities/image.entity'
import { UrlTableTuple } from '../mail/interfaces/url-table-tuple.interface'
import { OffersService } from '../offers/offers.service'
import { User } from '../users/entities/user.entity'
import { Product } from '../offers/entities/product.entity'

@Injectable()
export class OrdersService {
  constructor(
    private readonly usersService: UsersService,
    private readonly restaurantsService: RestaurantsService,
    private readonly offersService: OffersService,
    private readonly connection: Connection,
    @InjectRepository(OrdersRepository)
    private readonly ordersRepository: OrdersRepository,
    @InjectRepository(OrderedProductsRepository)
    private readonly orderedProductsRepository: OrderedProductsRepository
  ) {}
  async createOrder(
    createOrderRequestDto: CreateOrderRequestDto,
    user: User
  ): Promise<void> {
    const { restaurantId, tableId, totalPrice, orderedProducts } =
      createOrderRequestDto

    const queryRunner = this.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const ids = orderedProducts.map((orderedProduct) => {
        return orderedProduct.orderedProductId
      })

      const productEntities: Product[] = []
      for (const id of ids) {
        productEntities.push(await this.offersService.findProduct(id))
      }

      const matchingRestaurantIdsCount = productEntities.filter(
        (productEntity) => {
          return productEntity.restaurantId === restaurantId
        }
      ).length

      if (matchingRestaurantIdsCount !== orderedProducts.length) {
        throw new BadRequestException(
          'CreateOrderRequestDto',
          'Products are from different restaurants'
        )
      }

      const matchingPriceOrderedProducts = orderedProducts.filter(
        (orderedProduct) => {
          const quantity = orderedProduct.quantity
          const matchingId = productEntities.find((element) => {
            return element.id === orderedProduct.orderedProductId
          })
          return (
            this.roundToTwoDecimals(orderedProduct.price * quantity) ===
            this.roundToTwoDecimals(matchingId.price * quantity)
          )
        }
      )

      if (matchingPriceOrderedProducts.length !== orderedProducts.length) {
        throw new BadRequestException(
          'CreateOrderRequestDto',
          'Wrong ordered products price calculation'
        )
      }

      const calculatedTotal = this.roundToTwoDecimals(
        matchingPriceOrderedProducts.reduce((previousValue, currentValue) => {
          return (
            previousValue +
            this.roundToTwoDecimals(currentValue.price * currentValue.quantity)
          )
        }, 0)
      )

      if (calculatedTotal !== totalPrice) {
        throw new BadRequestException(
          'CreateOrderRequestDto',
          'Wrong total price calculation'
        )
      }

      const orderedProductEntites = orderedProducts.map(
        (orderedProduct, index) => {
          const orderedProductEntity = this.orderedProductsRepository.create()
          orderedProductEntity.orderedProductId =
            orderedProduct.orderedProductId
          orderedProductEntity.quantity = orderedProduct.quantity
          orderedProductEntity.price = this.roundToTwoDecimals(
            orderedProduct.price * orderedProduct.quantity
          )
          orderedProductEntity.name = productEntities[index].name
          orderedProductEntity.description = productEntities[index].description
          return orderedProductEntity
        }
      )

      await queryRunner.manager.save(orderedProductEntites)

      const orderEntity = this.ordersRepository.create()
      orderEntity.restaurantId = restaurantId
      orderEntity.tableId = tableId
      orderEntity.orderedProducts = orderedProductEntites
      orderEntity.totalPrice = calculatedTotal
      orderEntity.client = `${user.firstname} ${user.lastname}`

      await queryRunner.manager.save(orderEntity)

      await queryRunner.commitTransaction()
    } catch (error) {
      await queryRunner.rollbackTransaction()

      throw new ConflictException(error.message, 'Failed creating order')
    } finally {
      await queryRunner.release()
    }
  }

  roundToTwoDecimals(number: number): number {
    return Math.round((number + Number.EPSILON) * 100) / 100
  }
}
