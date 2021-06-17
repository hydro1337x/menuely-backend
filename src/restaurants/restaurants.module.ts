import { Module } from '@nestjs/common'
import { RestaurantsController } from './restaurants.controller'
import { RestaurantsService } from './restaurants.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RestaurantsRepository } from './restaurants.repository'
import { FilesModule } from '../files/files.module'

@Module({
  imports: [TypeOrmModule.forFeature([RestaurantsRepository]), FilesModule],
  controllers: [RestaurantsController],
  providers: [RestaurantsService],
  exports: [RestaurantsService]
})
export class RestaurantsModule {}
