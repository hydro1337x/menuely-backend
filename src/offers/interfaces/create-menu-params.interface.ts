import { Image } from '../../files/entities/image.entity'

export interface CreateMenuParams {
  name: string

  description: string

  currency: string

  image: Image
}
