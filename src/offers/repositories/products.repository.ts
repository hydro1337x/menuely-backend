import { EntityRepository, Repository } from 'typeorm'
import { Product } from '../entities/product.entity'
import { CreateProductParams } from '../interfaces/create-product-params.interface'
import { UniqueSearchCriteria } from '../../global/interfaces/unique-search-criteria.interface'

@EntityRepository(Product)
export class ProductsRepository extends Repository<Product> {
  async findProduct(id: number): Promise<Product> {
    const product = await this.findOne(id, { relations: ['category', 'image'] })

    return product
  }

  createProduct(createProductParams: CreateProductParams): Product {
    const { name, description, price, currency, category, image } =
      createProductParams

    const product = new Product()
    product.name = name
    product.description = description
    product.price = price
    product.currency = currency
    product.category = category
    product.image = image

    return product
  }
}
