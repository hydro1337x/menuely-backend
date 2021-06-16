import { EntityRepository, Repository } from 'typeorm'
import { Image } from './entities/image.entity'
import { CreateImageRequestDto } from './dto/create-image-request.dto'
import { InternalServerErrorException } from '@nestjs/common'

@EntityRepository(Image)
export class ImagesRepository extends Repository<Image> {
  async createImage(createImageDto: CreateImageRequestDto): Promise<Image> {
    const { name, url } = createImageDto
    const image = new Image()
    image.name = name
    image.url = url

    try {
      await image.save()
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Failed creating instance of image'
      )
    }

    return image
  }
}
