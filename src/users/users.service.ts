import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException
} from '@nestjs/common'
import { User } from './entities/user.entity'
import { UsersRepository } from './users.repository'
import { InjectRepository } from '@nestjs/typeorm'
import { UserRegistrationCredentialsDto } from '../auth/dtos/user-registration-credentials.dto'
import { UpdateUserProfileRequestDto } from './dtos/update-user-profile-request.dto'
import { UpdateUserPasswordRequestDto } from './dtos/update-user-password-request.dto'
import { UserProfileResponseDto } from './dtos/user-profile-response.dto'
import { plainToClass } from 'class-transformer'
import { UniqueSearchCriteria } from '../global/interfaces/unique-search-criteria.interface'
import { FilterUserRequestDto } from './dtos/filter-user-request.dto'
import * as bcrypt from 'bcrypt'
import { FilesService } from '../files/files.service'
import { Connection } from 'typeorm'
import { UpdateUserImageRequestDto } from './dtos/update-user-image-request.dto'
import { UserImageKind } from './enums/user-image-kind.enum'
import { UpdateUserEmailRequestDto } from './dtos/update-user-email-request.dto'
import { MailService } from '../mail/mail.service'
import appConfig from '../config/app.config'
import { ConfigType } from '@nestjs/config'
import { TokensService } from '../tokens/tokens.service'
import { JwtPayload } from '../tokens/interfaces/jwt-payload.interface'
import { JwtSignType } from '../tokens/enums/jwt-sign-type.enum'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersRepository)
    private readonly usersRepository: UsersRepository,
    private readonly filesService: FilesService,
    private readonly mailService: MailService,
    private readonly tokensService: TokensService,
    private readonly connection: Connection,
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>
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

  async getUsers(
    filterUserRequestDto: FilterUserRequestDto
  ): Promise<UserProfileResponseDto[]> {
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
  ): Promise<User> {
    const { password, ...result } = userRegistrationCredentialsDto

    const salt = await bcrypt.genSalt()

    const hashedPassword = await this.hashPassword(password, salt)

    return await this.usersRepository.createUser({
      password: hashedPassword,
      salt,
      ...result
    })
  }

  async updateUserProfile(
    updateUserProfileRequestDto: UpdateUserProfileRequestDto,
    user: User
  ): Promise<void> {
    const { firstname, lastname } = updateUserProfileRequestDto

    if (!firstname && !lastname) {
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

  async updateUserEmail(
    updateUserEmailRequestDto: UpdateUserEmailRequestDto,
    user: User
  ) {
    const { email } = updateUserEmailRequestDto

    user.email = email
    user.isVerified = false

    try {
      await user.save()
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Failed updating user email'
      )
    }

    const payload: JwtPayload = { id: user.id }

    const token = this.tokensService.signToken(
      payload,
      JwtSignType.VERIFICATION
    )

    const base = this.appConfiguration.baseUrl

    const url = new URL(base + '/auth/verify/user')

    url.searchParams.append('token', token)

    await this.mailService.sendVerification({
      email,
      name: user.firstname,
      url: url.toString()
    })
  }

  async updateUserImage(
    user,
    updateUserImageRequestDto: UpdateUserImageRequestDto,
    file: Express.Multer.File
  ) {
    const { kind } = updateUserImageRequestDto

    const queryRunner = this.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    const imageForDeletion =
      kind === UserImageKind.PROFILE ? user.profileImage : user.coverImage

    try {
      const image = await this.filesService.uploadImage({
        name: file.originalname,
        mime: file.mimetype,
        buffer: file.buffer
      })

      if (kind === UserImageKind.PROFILE) {
        user.profileImage = image
      }

      if (kind === UserImageKind.COVER) {
        user.coverImage = image
      }

      await queryRunner.manager.save(image)
      await queryRunner.manager.save(user)

      if (imageForDeletion) {
        const imageForDeletionName = imageForDeletion.name
        await queryRunner.manager.remove(imageForDeletion)
        await this.filesService.deleteRemoteImage(imageForDeletionName)
      }

      await queryRunner.commitTransaction()
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw new ConflictException(error.message, 'Failed updating user image')
    } finally {
      await queryRunner.release()
    }
  }

  async deleteUser(user: User): Promise<void> {
    try {
      await user.remove()
    } catch (error) {
      throw new InternalServerErrorException(error, 'Failed deleting user')
    }
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
