import { EntityRepository, Repository } from 'typeorm'
import { Category } from '../entities/category.entity'
import { CreateCategoryParams } from '../interfaces/create-category-params.interface'

@EntityRepository(Category)
export class CategoriesRepository extends Repository<Category> {
  createCategory(createCategoryParams: CreateCategoryParams): Category {
    const { name, menu, image } = createCategoryParams

    const category = new Category()
    category.name = name
    category.currency = menu.currency
    category.menu = menu
    category.image = image

    return category
  }
}
