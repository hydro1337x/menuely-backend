import { Module } from '@nestjs/common'
import { InvitationsController } from './invitations.controller'
import { InvitationsService } from './invitations.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { InvitationsRepository } from './invitations.repository'
import { UsersModule } from '../users/users.module'
import { RestaurantsService } from '../restaurants/restaurants.service'
import { RestaurantsModule } from '../restaurants/restaurants.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([InvitationsRepository]),
    UsersModule,
    RestaurantsModule
  ],
  controllers: [InvitationsController],
  providers: [InvitationsService]
})
export class InvitationsModule {}
