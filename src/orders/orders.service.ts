import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
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
import { UserOrderResponseDto } from './dtos/user-order-response.dto'
import { plainToClass } from 'class-transformer'
import { ProductResponseDto } from '../offers/dtos/product-response.dto'
import { RestaurantOrderResponseDto } from './dtos/restaurant-order-response.dto'
import { AcceptOrderRequestDto } from './dtos/accept-order-request.dto'

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
          orderedProductEntity.imageUrl = productEntities[index].image.url
          return orderedProductEntity
        }
      )

      await queryRunner.manager.save(orderedProductEntites)

      const restaurant = await this.restaurantsService.findRestaurant({
        id: productEntities[0].restaurantId
      })
      const currency = productEntities[0].currency
      const orderEntity = this.ordersRepository.create()
      orderEntity.restaurantId = restaurantId
      orderEntity.userId = user.id
      orderEntity.tableId = tableId
      orderEntity.orderedProducts = orderedProductEntites
      orderEntity.totalPrice = calculatedTotal
      orderEntity.currency = currency
      orderEntity.employerName = restaurant.name
      orderEntity.customerName = `${user.firstname} ${user.lastname}`

      await queryRunner.manager.save(orderEntity)

      await queryRunner.commitTransaction()
    } catch (error) {
      await queryRunner.rollbackTransaction()

      throw new ConflictException(error.message, 'Failed creating order')
    } finally {
      await queryRunner.release()
    }

    // Emit socket event
  }

  async getUserOrder(id: number, user: User): Promise<UserOrderResponseDto> {
    const order = await this.ordersRepository.findOrder(id)

    if (!order) {
      throw new NotFoundException(
        'UserOrderResponseDto',
        'Order does not exist'
      )
    }

    if (order.userId !== user.id) {
      throw new BadRequestException(
        'UserOrderResponseDto',
        'The order you are trying to access does not belong to you'
      )
    }

    const userOrderResponseDto = plainToClass(UserOrderResponseDto, order, {
      excludeExtraneousValues: true
    })

    return userOrderResponseDto
  }

  async getUserOrders(user): Promise<UserOrderResponseDto[]> {
    const orders = await this.ordersRepository.findUserOrders(user.id)

    const userOrderResponseDtos = plainToClass(UserOrderResponseDto, orders, {
      excludeExtraneousValues: true
    })

    return userOrderResponseDtos
  }

  async getRestaurantOrder(
    id: number,
    employee: User
  ): Promise<RestaurantOrderResponseDto> {
    if (!employee.employer) {
      throw new BadRequestException(
        'RestaurantOrderResponseDto',
        'Not employed'
      )
    }

    const order = await this.ordersRepository.findOrder(id)

    if (!order) {
      throw new NotFoundException(
        'RestaurantOrderResponseDto',
        'Order does not exist'
      )
    }

    if (employee.employer.id !== order.restaurantId) {
      throw new BadRequestException(
        'RestaurantOrderResponseDto',
        'The order you are trying to access does not belong to you'
      )
    }

    const restaurantOrderResponseDto = plainToClass(
      RestaurantOrderResponseDto,
      order,
      {
        excludeExtraneousValues: true
      }
    )

    return restaurantOrderResponseDto
  }

  async getRestaurantOrders(
    employee: User
  ): Promise<RestaurantOrderResponseDto[]> {
    if (!employee.employer) {
      throw new BadRequestException(
        'RestaurantOrderResponseDto',
        'Not employed'
      )
    }

    const restaurantId = employee.employer.id

    const orders = await this.ordersRepository.findRestaurantOrders(
      restaurantId
    )

    const restaurantOrderResponseDtos = plainToClass(
      RestaurantOrderResponseDto,
      orders,
      {
        excludeExtraneousValues: true
      }
    )

    return restaurantOrderResponseDtos
  }

  async acceptOrder(
    acceptOrderRequestDto: AcceptOrderRequestDto,
    employee: User
  ): Promise<void> {
    if (!employee.employer) {
      throw new BadRequestException('AcceptOrderRequestDto', 'Not employed')
    }

    const { orderId } = acceptOrderRequestDto

    const order = await this.ordersRepository.findOrder(orderId)

    if (!order) {
      throw new NotFoundException('AcceptOrderRequestDto', 'Order not found')
    }

    if (employee.employer.id !== order.restaurantId) {
      throw new BadRequestException(
        'AcceptOrderRequestDto',
        'The order you are trying to access does not belong to you'
      )
    }

    order.employeeName = `${employee.firstname} ${employee.lastname}`

    try {
      await order.save()
    } catch (error) {
      throw new InternalServerErrorException(error, 'Failed accepting order')
    }

    // Emit socket event
  }

  roundToTwoDecimals(number: number): number {
    return Math.round((number + Number.EPSILON) * 100) / 100
  }
}
