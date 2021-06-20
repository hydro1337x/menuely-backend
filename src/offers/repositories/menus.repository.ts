import { EntityRepository, Repository } from 'typeorm'
import { Menu } from '../entities/menu.entity'

@EntityRepository(Menu)
export class MenusRepository extends Repository<Menu> {}
