import { EntityRepository, Repository } from 'typeorm'
import { Invitation } from './entities/invitation.entity'
import { CreateInvitationParams } from './interfaces/create-invitation-params.interface'

@EntityRepository(Invitation)
export class InvitationsRepository extends Repository<Invitation> {
  createInvitation(createInvitationParams: CreateInvitationParams) {
    const { employeeId, employerId } = createInvitationParams

    const invitation = this.create()
    invitation.employeeId = employeeId
    invitation.employerId = employerId

    return invitation
  }
}
