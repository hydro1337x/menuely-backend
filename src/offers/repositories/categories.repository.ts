import { EntityRepository, Repository } from 'typeorm'
import { Category } from '../entities/category.entity'
import { CreateCategoryParams } from '../interfaces/create-category-params.interface'

@EntityRepository(Category)
export class CategoriesRepository extends Repository<Category> {
  async findCategory(id: number): Promise<Category> {
    const category = await this.findOne(id, { relations: ['menu', 'image'] })

    return category
  }

  async findCategories(menuId: number): Promise<Category[]> {
    const query = this.createQueryBuilder('category')

    if (menuId) {
      query.where('category.menuId = :menuId', { menuId })
    }

    const categories = await query
      .leftJoinAndSelect('category.image', 'image')
      .leftJoinAndSelect('category.menu', 'menu')
      .getMany()

    return categories
  }

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
