import { EntityRepository, Repository } from 'typeorm'
import { User } from './entities/user.entity'
import { UserRegistrationCredentialsDto } from '../auth/dtos/user-registration-credentials.dto'
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException
} from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { UpdateUserProfileRequestDto } from './dtos/update-user-profile-request.dto'
import { UpdateUserPasswordRequestDto } from './dtos/update-user-password-request.dto'
import { UniqueSearchCriteria } from '../global/interfaces/unique-search-criteria.interface'

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

  async findUser(
    searchCriteria: UniqueSearchCriteria
  ): Promise<User | undefined> {
    const { id, email } = searchCriteria
    const query = this.createQueryBuilder('user')

    if (id) {
      query.where('user.id = :id', { id: id })
    }

    if (email) {
      query.where('user.email = :email', { email: email })
    }

    const user = await query
      .leftJoinAndSelect('user.refreshTokens', 'refreshToken')
      .getOne()

    return user
  }

  async updateUserProfile(
    updateUserProfileRequestDto: UpdateUserProfileRequestDto,
    user: User
  ): Promise<void> {
    const { firstname, lastname, profileImageUrl } = updateUserProfileRequestDto

    if (!firstname && !lastname && !profileImageUrl) {
      throw new BadRequestException('At least one field can not be empty')
    }

    if (firstname) {
      user.firstname = firstname
    }

    if (lastname) {
      user.lastname = lastname
    }

    if (profileImageUrl) {
      user.profileImageUrl = profileImageUrl
    }

    try {
      await user.save()
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Failed updating user profile'
      )
    }
  }

  async updateUserPassword(
    updateUserPasswordRequestDto: UpdateUserPasswordRequestDto,
    user: User
  ): Promise<void> {
    const { oldPassword, newPassword, repeatedNewPassword } =
      updateUserPasswordRequestDto

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password)

    if (!isOldPasswordValid) {
      throw new BadRequestException('Wrong old password')
    }

    if (newPassword !== repeatedNewPassword) {
      throw new BadRequestException('Passwords do not match')
    }

    user.salt = await bcrypt.genSalt()
    user.password = await this.hashPassword(newPassword, user.salt)

    try {
      await user.save()
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Failed updating new password'
      )
    }
  }

  async hashPassword(password: string, salt: string): Promise<string> {
    return await bcrypt.hash(password, salt)
  }
}
