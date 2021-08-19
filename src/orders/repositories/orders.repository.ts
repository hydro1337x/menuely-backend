import { EntityRepository, Repository } from 'typeorm'
import { Order } from '../entities/order.entity'

@EntityRepository(Order)
export class OrdersRepository extends Repository<Order> {
  async findOrder(id: number): Promise<Order> {
    const order = await this.findOne(id, {
      relations: ['orderedProducts']
    })
    return order
  }

  async findUserOrders(userId: number): Promise<Order[]> {
    const query = this.createQueryBuilder('order')

    if (userId) {
      query.where('order.userId = :userId', { userId })
    }

    // query.orderBy('order.createdAt', 'DESC')
    query.orderBy('order.updatedAt', 'ASC')

    const orders = await query
      .leftJoinAndSelect('order.orderedProducts', 'orderedProducts')
      .getMany()

    return orders
  }

  async findRestaurantOrders(restaurantId: number): Promise<Order[]> {
    const query = this.createQueryBuilder('order')

    if (restaurantId) {
      query.where('order.restaurantId = :restaurantId', { restaurantId })
    }

    query.orderBy('order.updatedAt', 'ASC')

    const orders = await query
      .leftJoinAndSelect('order.orderedProducts', 'orderedProducts')
      .getMany()

    return orders
  }
}
