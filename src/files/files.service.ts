import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnsupportedMediaTypeException
} from '@nestjs/common'
import * as AWS from 'aws-sdk'
import { S3 } from 'aws-sdk'
import { v4 as uuid } from 'uuid'
import { ConfigType } from '@nestjs/config'
import { ImageMimeType } from './enum/image-type.enum'
import { CreateImageRequestDto } from './dto/create-image-request.dto'
import { Image } from './entities/image.entity'
import { ImagesRepository } from './images.repository'
import { InjectRepository } from '@nestjs/typeorm'
import filesConfig from './config/files.config'
import { plainToClass } from 'class-transformer'
import { CreateImageResponseDto } from './dto/create-image-response.dto'

@Injectable()
export class FilesService {
  private s3: S3

  constructor(
    @InjectRepository(ImagesRepository)
    private imagesRepository: ImagesRepository,
    @Inject(filesConfig.KEY)
    private readonly filesConfiguration: ConfigType<typeof filesConfig>
  ) {
    this.s3 = new AWS.S3()
    AWS.config.update({
      accessKeyId: filesConfiguration.awsAccessKeyID,
      secretAccessKey: filesConfiguration.awsSecretAccessKey
    })
  }

  async uploadImage(
    file: Express.Multer.File
  ): Promise<CreateImageResponseDto> {
    if (!Object.values<string>(ImageMimeType).includes(file.mimetype)) {
      throw new UnsupportedMediaTypeException()
    }

    const params = {
      Bucket: this.filesConfiguration.awsS3BucketName,
      Body: file.buffer,
      Key: `${uuid()}-${file.originalname}`,
      ACL: 'public-read'
    }

    const uploadResult = await this.s3.upload(params).promise()

    if (!uploadResult) {
      throw new ConflictException('File upload failed')
    }

    const createImageDto = new CreateImageRequestDto()
    createImageDto.url = uploadResult.Location
    createImageDto.name = uploadResult.Key

    const image = await this.imagesRepository.createImage(createImageDto)

    const imageResponseDto = plainToClass(CreateImageResponseDto, image, {
      excludeExtraneousValues: true
    })

    return imageResponseDto
  }

  async deleteRemoteImage(name: string) {
    const deletionParams = {
      Bucket: this.filesConfiguration.awsS3BucketName,
      Key: name
    }

    await this.s3.deleteObject(deletionParams).promise()
  }

  async removeLocalImage(image: Image) {
    await this.imagesRepository.remove(image)
  }
}
