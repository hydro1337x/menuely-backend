import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common'
import { FilesService } from './files.service'
import { FileInterceptor } from '@nestjs/platform-express'

@Controller('upload')
export class FilesController {
  constructor(private readonly uploadService: FilesService) {}
}
