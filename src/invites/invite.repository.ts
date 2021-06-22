import { EntityRepository, Repository } from 'typeorm'
import { Invite } from './entities/invite.entity'

@EntityRepository(Invite)
export class InvitesRepository extends Repository<Invite> {}
