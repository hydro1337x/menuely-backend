import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FilesService } from './files.service'
import { FileInterceptor } from '@nestjs/platform-express'
import { CreateImageResponseDto } from './dto/create-image-response.dto'

@Controller('upload')
export class FilesController {
  constructor(private filesService: FilesService) {}
  @Post('image')
  @UseInterceptors(FileInterceptor('image'))
  uploadImage(
    @UploadedFile() file: Express.Multer.File
  ): Promise<CreateImageResponseDto> {
    return this.filesService.uploadImage(file)
  }
}
