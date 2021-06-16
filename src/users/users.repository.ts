import { EntityRepository, Repository } from 'typeorm'
import { User } from './entities/user.entity'
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException
} from '@nestjs/common'
import { UpdateUserProfileRequestDto } from './dtos/update-user-profile-request.dto'
import { UniqueSearchCriteria } from '../global/interfaces/unique-search-criteria.interface'
import { FilterUserRequestDto } from './dtos/filter-user-request.dto'
import { UpdateUserPasswordParams } from './interfaces/update-user-password-params.interface'
import { CreateUserParams } from './interfaces/create-user-params.interface'

@EntityRepository(User)
export class UsersRepository extends Repository<User> {
  async createUser(createUserParams: CreateUserParams): Promise<void> {
    const { email, password, firstname, lastname, salt } = createUserParams

    const user = new User()
    user.email = email
    user.passwordSalt = salt
    user.password = password
    user.firstname = firstname
    user.lastname = lastname

    try {
      await user.save()
    } catch (error) {
      if (error.code == 23505) {
        throw new ConflictException(error, 'Duplicate email')
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

  async findUsers(filterUserRequestDto: FilterUserRequestDto): Promise<User[]> {
    const { search } = filterUserRequestDto
    const query = this.createQueryBuilder('user')

    if (search) {
      query.where(
        '(user.email LIKE :search OR user.firstname LIKE :search OR user.lastname LIKE :search)',
        { search: `%${search}%` }
      )
    }

    const users = await query.getMany()

    return users
  }

  async updateUserProfile(
    updateUserProfileRequestDto: UpdateUserProfileRequestDto,
    user: User
  ): Promise<void> {
    const { firstname, lastname, profileImageUrl } = updateUserProfileRequestDto

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
    updateUserPasswordParams: UpdateUserPasswordParams
  ): Promise<void> {
    const { password, salt, user } = updateUserPasswordParams

    user.passwordSalt = salt
    user.password = password

    try {
      await user.save()
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Failed updating new password'
      )
    }
  }
}
