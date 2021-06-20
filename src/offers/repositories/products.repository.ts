import { EntityRepository, Repository } from 'typeorm'
import { Product } from '../entities/product.entity'
import { CreateProductParams } from '../interfaces/create-product-params.interface'

@EntityRepository(Product)
export class ProductsRepository extends Repository<Product> {
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
