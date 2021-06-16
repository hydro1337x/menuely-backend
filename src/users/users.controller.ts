import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
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

  @Patch('me/update/profile')
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

  @Patch('me/update/password')
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
}
