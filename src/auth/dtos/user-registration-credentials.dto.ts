import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator'

export class UserRegistrationCredentialsDto {
  @IsEmail()
  email: string

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  password: string

  @IsString()
  @MinLength(1)
  firstname: string

  @IsString()
  @MinLength(1)
  lastname: string
}
