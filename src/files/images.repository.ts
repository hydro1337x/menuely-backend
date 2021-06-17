import { EntityRepository, Repository } from 'typeorm'
import { Image } from './entities/image.entity'
import { CreateImageParams } from './interfaces/create-image-params.interface'

@EntityRepository(Image)
export class ImagesRepository extends Repository<Image> {
  createImage(createImageParams: CreateImageParams): Image {
    const { name, url } = createImageParams
    const image = new Image()
    image.name = name
    image.url = url

    return image
  }
}
