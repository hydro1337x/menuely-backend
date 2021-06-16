import { BadRequestException, Injectable } from '@nestjs/common'
import { User } from './entities/user.entity'
import { UsersRepository } from './users.repository'
import { InjectRepository } from '@nestjs/typeorm'
import { UserRegistrationCredentialsDto } from '../auth/dtos/user-registration-credentials.dto'
import { UpdateUserProfileRequestDto } from './dtos/update-user-profile-request.dto'
import { UpdateUserPasswordRequestDto } from './dtos/update-user-password-request.dto'
import { UserProfileResponseDto } from './dtos/user-profile-response.dto'
import { plainToClass } from 'class-transformer'
import { UniqueSearchCriteria } from '../global/interfaces/unique-search-criteria.interface'

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

  async createUser(
    registrationCredentialsDto: UserRegistrationCredentialsDto
  ): Promise<void> {
    return await this.usersRepository.createUser(registrationCredentialsDto)
  }

  async updateUserProfile(
    updateUserProfileRequestDto: UpdateUserProfileRequestDto,
    user: User
  ): Promise<void> {
    return await this.usersRepository.updateUserProfile(
      updateUserProfileRequestDto,
      user
    )
  }

  async updateUserPassword(
    updateUserPasswordRequestDto: UpdateUserPasswordRequestDto,
    user: User
  ): Promise<void> {
    return await this.usersRepository.updateUserPassword(
      updateUserPasswordRequestDto,
      user
    )
  }

  formatUserProfileResponse(user: User): UserProfileResponseDto {
    return plainToClass(UserProfileResponseDto, user, {
      excludeExtraneousValues: true
    })
  }
}
