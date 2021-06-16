import { BadRequestException, Injectable } from '@nestjs/common'
import { User } from './entities/user.entity'
import { UsersRepository } from './users.repository'
import { InjectRepository } from '@nestjs/typeorm'
import { UserRegistrationCredentialsDto } from '../auth/dtos/user-registration-credentials.dto'
import { UpdateUserProfileRequestDto } from './dtos/update-user-profile-request.dto'
import { UpdateUserPasswordRequestDto } from './dtos/update-user-password-request.dto'
import { UserProfileResponseDto } from './dtos/user-profile-response.dto'
import { classToPlain, plainToClass } from 'class-transformer'
import { UniqueSearchCriteria } from '../global/interfaces/unique-search-criteria.interface'
import { FilterUserRequestDto } from './dtos/filter-user-request.dto'
import * as bcrypt from 'bcrypt'
import { CreateUserParams } from './interfaces/create-user-params.interface'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersRepository)
    private usersRepository: UsersRepository
  ) {}

  async findUser(
    searchCriteria: UniqueSearchCriteria
  ): Promise<User | undefined> {
    return await this.usersRepository.findUser(searchCriteria)
  }

  async getUser(id: number): Promise<UserProfileResponseDto> {
    const user = await this.findUser({ id })

    if (!user) {
      throw new BadRequestException('User not found')
    }

    const userProfileResponseDto = plainToClass(UserProfileResponseDto, user, {
      excludeExtraneousValues: true
    })

    return userProfileResponseDto
  }

  async getUsers(filterUserRequestDto: FilterUserRequestDto) {
    const users = await this.usersRepository.findUsers(filterUserRequestDto)

    const userProfileResponseDtos = plainToClass(
      UserProfileResponseDto,
      users,
      {
        excludeExtraneousValues: true
      }
    )

    return userProfileResponseDtos
  }

  async createUser(
    userRegistrationCredentialsDto: UserRegistrationCredentialsDto
  ): Promise<void> {
    const { password, ...result } = userRegistrationCredentialsDto

    const salt = await bcrypt.genSalt()

    const hashedPassword = await this.hashPassword(password, salt)

    const createUserParams: CreateUserParams = {
      password: hashedPassword,
      salt,
      ...result
    }

    return await this.usersRepository.createUser(createUserParams)
  }

  async updateUserProfile(
    updateUserProfileRequestDto: UpdateUserProfileRequestDto,
    user: User
  ): Promise<void> {
    const { firstname, lastname, profileImageUrl } = updateUserProfileRequestDto

    if (!firstname && !lastname && !profileImageUrl) {
      throw new BadRequestException('At least one field can not be empty')
    }

    return await this.usersRepository.updateUserProfile(
      updateUserProfileRequestDto,
      user
    )
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

    const salt = await bcrypt.genSalt()

    const hashedPassword = await this.hashPassword(newPassword, salt)

    return await this.usersRepository.updateUserPassword({
      password: hashedPassword,
      salt,
      user
    })
  }

  formatUserProfileResponse(user: User): UserProfileResponseDto {
    return plainToClass(UserProfileResponseDto, user, {
      excludeExtraneousValues: true
    })
  }

  async hashPassword(password: string, salt: string): Promise<string> {
    return await bcrypt.hash(password, salt)
  }
}
