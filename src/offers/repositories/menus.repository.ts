import { EntityRepository, Repository } from 'typeorm'
import { Menu } from '../entities/menu.entity'
import { CreateMenuParams } from '../interfaces/create-menu-params.interface'

@EntityRepository(Menu)
export class MenusRepository extends Repository<Menu> {
  createMenu(createMenuParams: CreateMenuParams): Menu {
    const { name, description, currency, image } = createMenuParams

    const menu = new Menu()
    menu.name = name
    menu.description = description
    menu.currency = currency
    menu.qrCodeImage = image

    return menu
  }
}
