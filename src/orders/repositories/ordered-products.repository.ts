import { EntityRepository, Repository } from 'typeorm'
import { OrderedProduct } from '../entities/ordered-product.entity'

@EntityRepository(OrderedProduct)
export class OrderedProductsRepository extends Repository<OrderedProduct> {}
