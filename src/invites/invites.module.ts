import { Module } from '@nestjs/common'
import { InvitesController } from './invites.controller'
import { InvitesService } from './invites.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { InvitesRepository } from './invite.repository'

@Module({
  imports: [TypeOrmModule.forFeature([InvitesRepository])],
  controllers: [InvitesController],
  providers: [InvitesService]
})
export class InvitesModule {}
