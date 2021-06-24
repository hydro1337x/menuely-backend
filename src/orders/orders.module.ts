import { Module } from '@nestjs/common'
import { OrdersController } from './orders.controller'
import { OrdersService } from './orders.service'
import { RestaurantsModule } from '../restaurants/restaurants.module'
import { UsersModule } from '../users/users.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OrdersRepository } from './repositories/orders.repository'
import { OrderedProductsRepository } from './repositories/ordered-products.repository'
import { OffersModule } from '../offers/offers.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([OrdersRepository, OrderedProductsRepository]),
    RestaurantsModule,
    UsersModule,
    OffersModule
  ],
  controllers: [OrdersController],
  providers: [OrdersService]
})
export class OrdersModule {}
