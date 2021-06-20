import { Image } from '../../files/entities/image.entity'
import { Menu } from '../entities/menu.entity'

export interface CreateCategoryParams {
  name: string

  menu: Menu

  image: Image
}
