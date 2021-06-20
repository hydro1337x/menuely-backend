import { Image } from '../../files/entities/image.entity'
import { Category } from '../entities/category.entity'

export interface CreateProductParams {
  name: string

  description: string

  price: number

  currency: string

  category: Category

  image: Image
}
