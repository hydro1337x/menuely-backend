import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe
} from '@nestjs/common'
import { RestaurantAccessJwtAuthGuard } from '../auth/guards/restaurant-access-jwt-auth.guard'
import { CreateInvitationRequestDto } from './dtos/create-invitation-request.dto'
import { InvitationsService } from './invitations.service'
import { AuthenticatedEntity } from '../auth/decorators/authenticated-entity.decorator'
import { Restaurant } from '../restaurants/entities/restaurant.entity'
import { AccessJwtAuthGuard } from '../auth/guards/access-jwt-auth.guard'
import { InvitationResponseDto } from './dtos/invitation-response.dto'
import { UserAccessJwtAuthGuard } from '../auth/guards/user-access-jwt-auth.guard'
import { User } from '../users/entities/user.entity'
import { AcceptInvitationRequestDto } from './dtos/accept-invitation-request.dto'
import { RejectInvitationRequestDto } from './dtos/reject-invitation-request.dto'

@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Get()
  @UseGuards(AccessJwtAuthGuard)
  getInvitations(
    @AuthenticatedEntity() entity
  ): Promise<InvitationResponseDto[]> {
    return this.invitationsService.getInvitations(entity)
  }

  @Post('accept')
  @UseGuards(UserAccessJwtAuthGuard)
  @UsePipes(ValidationPipe)
  acceptInvitation(
    @Body() acceptInvitationRequestDto: AcceptInvitationRequestDto,
    @AuthenticatedEntity() user: User
  ): Promise<void> {
    return this.invitationsService.acceptInvitation(
      acceptInvitationRequestDto,
      user
    )
  }

  @Post('create')
  @UseGuards(RestaurantAccessJwtAuthGuard)
  @UsePipes(ValidationPipe)
  createInvitation(
    @Body() createInvitationRequestDto: CreateInvitationRequestDto,
    @AuthenticatedEntity() restaurant: Restaurant
  ): Promise<void> {
    return this.invitationsService.createInvitation(
      createInvitationRequestDto,
      restaurant
    )
  }

  @Post('reject')
  @UseGuards(AccessJwtAuthGuard)
  @UsePipes(ValidationPipe)
  rejectInvitation(
    @Body() rejectInvitationRequestDto: RejectInvitationRequestDto,
    @AuthenticatedEntity() entity
  ): Promise<void> {
    return this.invitationsService.rejectInvitation(
      rejectInvitationRequestDto,
      entity
    )
  }
}
