import { IsEmail } from 'class-validator'

export class UpdateUserEmailRequestDto {
  @IsEmail()
  email: string
}
