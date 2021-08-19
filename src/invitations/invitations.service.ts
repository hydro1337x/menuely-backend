import {
  BadRequestException,
  ForbiddenException,
  Injectable
} from '@nestjs/common'
import { CreateInvitationRequestDto } from './dtos/create-invitation-request.dto'
import { Restaurant } from '../restaurants/entities/restaurant.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { InvitationsRepository } from './invitations.repository'
import { User } from '../users/entities/user.entity'
import { Invitation } from './entities/invitation.entity'
import { InvitationResponseDto } from './dtos/invitation-response.dto'
import { plainToClass } from 'class-transformer'
import { AcceptInvitationRequestDto } from './dtos/accept-invitation-request.dto'
import { UsersService } from '../users/users.service'
import { RestaurantsService } from '../restaurants/restaurants.service'
import { MenuResponseDto } from '../offers/dtos/menu-response.dto'
import { UserProfileResponseDto } from '../users/dtos/user-profile-response.dto'
import { RestaurantProfileResponseDto } from '../restaurants/dtos/restaurant-profile-response.dto'
import { RejectInvitationRequestDto } from './dtos/reject-invitation-request.dto'
import Any = jasmine.Any

@Injectable()
export class InvitationsService {
  constructor(
    @InjectRepository(InvitationsRepository)
    private readonly invitationsRepository: InvitationsRepository,
    private readonly restaurantsService: RestaurantsService,
    private readonly usersService: UsersService
  ) {}

  async getInvitations(entity: any): Promise<InvitationResponseDto[]> {
    let invitations: Invitation[]

    if (entity instanceof User) {
      invitations = await this.getUserInvitations(entity)
    }

    if (entity instanceof Restaurant) {
      invitations = await this.getRestaurantInvitations(entity)
    }

    let invitationResponseDtos: InvitationResponseDto[] = []

    for (const invitation of invitations) {
      const user = await this.usersService.findUser({
        id: invitation.employeeId
      })

      const restaurant = await this.restaurantsService.findRestaurant({
        id: invitation.employerId
      })

      const invitationResponseDto = new InvitationResponseDto()
      invitationResponseDto.id = invitation.id

      const userResponseDto = plainToClass(UserProfileResponseDto, user, {
        excludeExtraneousValues: true
      })

      const restaurantResponseDto = plainToClass(
        RestaurantProfileResponseDto,
        restaurant,
        {
          excludeExtraneousValues: true
        }
      )

      invitationResponseDto.employee = userResponseDto
      invitationResponseDto.employer = restaurantResponseDto

      invitationResponseDtos.push(invitationResponseDto)
    }

    return invitationResponseDtos
  }

  private async getUserInvitations(user: User): Promise<Invitation[]> {
    return await this.invitationsRepository.find({ employeeId: user.id })
  }

  private async getRestaurantInvitations(
    restaurant: Restaurant
  ): Promise<Invitation[]> {
    return await this.invitationsRepository.find({
      employerId: restaurant.id
    })
  }

  async acceptInvitation(
    acceptInvitationRequestDto: AcceptInvitationRequestDto,
    user: User
  ) {
    const { invitationId, employerId } = acceptInvitationRequestDto

    const invitation = await this.invitationsRepository.findOne({
      id: invitationId
    })

    const employer = await this.restaurantsService.findRestaurant({
      id: employerId
    })

    if (!invitation) {
      throw new BadRequestException(
        'AcceptInvitationRequestDto',
        'Invitation not found'
      )
    }

    if (!employer) {
      throw new BadRequestException(
        'AcceptInvitationRequestDto',
        'Employer not found'
      )
    }

    if (user.id !== invitation.employeeId) {
      throw new ForbiddenException(
        'AcceptInvitationRequestDto',
        'Resource not owned'
      )
    }

    await this.usersService.updateUserEmployer(employer, user)
    await this.invitationsRepository.remove(invitation)
  }

  async createInvitation(
    createInvitationRequestDto: CreateInvitationRequestDto,
    restaurant: Restaurant
  ) {
    const { employeeId } = createInvitationRequestDto

    const invitations = await this.invitationsRepository.find({
      employeeId
    })

    if (invitations.length > 0) {
      throw new BadRequestException(
        'CreateInvitationRequestDto',
        'Employee already invited'
      )
    }

    const employee = await this.usersService.findUser({ id: employeeId })

    if (!employee) {
      throw new BadRequestException(
        'CreateInvitationRequestDto',
        'Employee not found'
      )
    }

    const invitation = this.invitationsRepository.createInvitation({
      employeeId: employeeId,
      employerId: restaurant.id
    })

    await invitation.save()
  }

  async rejectInvitation(
    rejectInvitationRequestDto: RejectInvitationRequestDto,
    entity: any
  ) {
    const invitation = await this.invitationsRepository.findOne({
      id: rejectInvitationRequestDto.invitationId
    })

    if (!invitation) {
      throw new BadRequestException(
        'RejectInvitationRequestDto',
        'Invitation not found'
      )
    }

    if (entity instanceof User) {
      await this.rejectUserInvitation(entity, invitation)
    }

    if (entity instanceof Restaurant) {
      await this.rejectRestaurantInvitation(entity, invitation)
    }
  }

  private async rejectUserInvitation(user: User, invitation: Invitation) {
    if (user.id === invitation.employeeId) {
      await this.invitationsRepository.remove(invitation)
    }
  }

  private async rejectRestaurantInvitation(
    restaurant: Restaurant,
    invitation: Invitation
  ) {
    if (restaurant.id === invitation.employerId) {
      await this.invitationsRepository.remove(invitation)
    }
  }
}
