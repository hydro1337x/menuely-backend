import { Module } from '@nestjs/common'
import { FilesController } from './files.controller'
import { FilesService } from './files.service'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ImagesRepository } from './images.repository'

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([ImagesRepository])],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService]
})
export class FilesModule {}
