import { Injectable } from '@nestjs/common'
import { User } from './entities/user.entity'
import { UsersRepository } from './users.repository'
import { InjectRepository } from '@nestjs/typeorm'
import { UserRegistrationCredentialsDto } from '../auth/dtos/user-registration-credentials.dto'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersRepository)
    private usersRepository: UsersRepository
  ) {}

  async findUser(email: string): Promise<User | undefined> {
    return await this.usersRepository.findOne(
      { email },
      { relations: ['refreshTokens'] }
    )
  }

  async createUser(
    registrationCredentialsDto: UserRegistrationCredentialsDto
  ): Promise<void> {
    return await this.usersRepository.createUser(registrationCredentialsDto)
  }
}
