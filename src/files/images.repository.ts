import { EntityRepository, Repository } from 'typeorm'
import { Image } from './entities/image.entity'
import { CreateImageRequestDto } from './dto/create-image-request.dto'

@EntityRepository(Image)
export class ImagesRepository extends Repository<Image> {
  createImage(createImageDto: CreateImageRequestDto): Image {
    const { name, url } = createImageDto
    const image = new Image()
    image.name = name
    image.url = url

    return image
  }
}
