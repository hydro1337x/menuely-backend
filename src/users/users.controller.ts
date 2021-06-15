import {
  Body,
  Controller,
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

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // @Patch(':id/update')
  // @UseGuards(UserAccessJwtAuthGuard)
  // @UsePipes(new ValidationPipe({ whitelist: true }))
  // updateUser(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() updateUserRequestDto: UpdateUserRequestDto,
  //   @AuthenticatedUser() user: User
  // ) {
  //   this.usersService.updateUser(id, updateUserRequestDto, user)
  // }
}
