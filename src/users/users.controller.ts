import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe
} from '@nestjs/common'
import { UserAccessJwtAuthGuard } from '../auth/guards/user-access-jwt-auth.guard'
import { AuthenticatedEntity } from '../auth/decorators/authenticated-entity.decorator'
import { User } from './entities/user.entity'
import { UsersService } from './users.service'
import { UpdateUserProfileRequestDto } from './dtos/update-user-profile-request.dto'
import { UpdateUserPasswordRequestDto } from './dtos/update-user-password-request.dto'
import { UserProfileResponseDto } from './dtos/user-profile-response.dto'
import { FilterUserRequestDto } from './dtos/filter-user-request.dto'
import { FileInterceptor } from '@nestjs/platform-express'
import { UpdateUserImageRequestDto } from './dtos/update-user-image-request.dto'
import { UpdateUserEmailRequestDto } from './dtos/update-user-email-request.dto'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(UserAccessJwtAuthGuard)
  getAuthenticatedUserProfile(
    @AuthenticatedEntity() user: User
  ): UserProfileResponseDto {
    return this.usersService.formatUserProfileResponse(user)
  }

  @Get(':id')
  getUser(
    @Param('id', ParseIntPipe) id: number
  ): Promise<UserProfileResponseDto> {
    return this.usersService.getUser(id)
  }

  @Get()
  getUsers(
    @Query(ValidationPipe) filterUserRequestDto: FilterUserRequestDto
  ): Promise<UserProfileResponseDto[]> {
    return this.usersService.getUsers(filterUserRequestDto)
  }

  @Patch('me/profile')
  @UseGuards(UserAccessJwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  updateUserProfile(
    @Body() updateUserProfileRequestDto: UpdateUserProfileRequestDto,
    @AuthenticatedEntity() user: User
  ): Promise<void> {
    return this.usersService.updateUserProfile(
      updateUserProfileRequestDto,
      user
    )
  }

  @Patch('me/password')
  @UseGuards(UserAccessJwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  updateUserPassword(
    @Body() updateUserPasswordRequestDto: UpdateUserPasswordRequestDto,
    @AuthenticatedEntity() user: User
  ): Promise<void> {
    return this.usersService.updateUserPassword(
      updateUserPasswordRequestDto,
      user
    )
  }

  @Patch('me/email')
  @UseGuards(UserAccessJwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  updateUserEmail(
    @Body() updateUserEmailRequestDto: UpdateUserEmailRequestDto,
    @AuthenticatedEntity() user: User
  ) {
    return this.usersService.updateUserEmail(updateUserEmailRequestDto, user)
  }

  @Patch('me/image')
  @UseGuards(UserAccessJwtAuthGuard)
  @UsePipes(ValidationPipe)
  @UseInterceptors(FileInterceptor('image'))
  updateUserImage(
    @AuthenticatedEntity() user: User,
    @Body() updateUserImageRequestDto: UpdateUserImageRequestDto,
    @UploadedFile() file: Express.Multer.File
  ): Promise<void> {
    return this.usersService.updateUserImage(
      user,
      updateUserImageRequestDto,
      file
    )
  }

  @Delete('me')
  @UseGuards(UserAccessJwtAuthGuard)
  deleteUser(@AuthenticatedEntity() user: User): Promise<void> {
    return this.usersService.deleteUser(user)
  }
}
