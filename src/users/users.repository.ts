import { EntityRepository, Repository } from 'typeorm'
import { User } from './entities/user.entity'
import { UserRegistrationCredentialsDto } from '../auth/dtos/user-registration-credentials.dto'
import { ConflictException, InternalServerErrorException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'

@EntityRepository(User)
export class UsersRepository extends Repository<User> {
  async createUser(
    userRegistrationCredentialsDto: UserRegistrationCredentialsDto
  ): Promise<void> {
    const { email, password, firstname, lastname } =
      userRegistrationCredentialsDto

    const user = new User()
    user.email = email
    user.salt = await bcrypt.genSalt()
    user.password = await this.hashPassword(password, user.salt)
    user.firstname = firstname
    user.lastname = lastname

    try {
      await user.save()
    } catch (error) {
      if (error.code == 23505) {
        throw new ConflictException('Duplicate email')
      } else {
        throw new InternalServerErrorException() // Unexpected error, case not handeled
      }
    }
  }

  async findUser(email: string): Promise<User | undefined> {
    return await User.findOne({ email }, { relations: ['refreshTokens'] })
  }

  async hashPassword(password: string, salt: string): Promise<string> {
    return await bcrypt.hash(password, salt)
  }
}
