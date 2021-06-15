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
import { UserJwtAuthGuard } from '../auth/guards/user-jwt-auth.guard'
import { AuthenticatedUser } from '../auth/decorators/authenticated-user.decorator'
import { User } from './entities/user.entity'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // @Patch(':id/update')
  // @UseGuards(UserJwtAuthGuard)
  // @UsePipes(new ValidationPipe({ whitelist: true }))
  // updateUser(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() updateUserRequestDto: UpdateUserRequestDto,
  //   @AuthenticatedUser() user: User
  // ) {
  //   this.usersService.updateUser(id, updateUserRequestDto, user)
  // }
}
