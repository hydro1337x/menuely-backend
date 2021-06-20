import { IsEmail } from 'class-validator'

export class UpdateRestaurantEmailRequestDto {
  @IsEmail()
  email: string
}
