import { EntityRepository, Repository } from 'typeorm'
import { Menu } from '../entities/menu.entity'
import { CreateMenuParams } from '../interfaces/create-menu-params.interface'

@EntityRepository(Menu)
export class MenusRepository extends Repository<Menu> {
  async findMenu(id: number): Promise<Menu> {
    const menu = await this.findOne(id, { relations: ['qrCodeImage'] })

    return menu
  }

  async findMenus(restaurantId: number): Promise<Menu[]> {
    const query = this.createQueryBuilder('menu')

    if (restaurantId) {
      query.where('menu.restaurantId = :restaurantId', { restaurantId })
    }

    const menus = await query
      .leftJoinAndSelect('menu.qrCodeImage', 'qrCodeImage')
      .leftJoinAndSelect('menu.restaurant', 'restaurant')
      .getMany()

    return menus
  }

  createMenu(createMenuParams: CreateMenuParams): Menu {
    const { name, description, currency } = createMenuParams

    const menu = new Menu()
    menu.name = name
    menu.description = description
    menu.currency = currency

    return menu
  }
}
