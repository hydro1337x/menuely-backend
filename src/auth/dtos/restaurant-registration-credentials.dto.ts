import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator'

export class RestaurantRegistrationCredentialsDto {
  @IsEmail()
  email: string

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  password: string

  @IsString()
  @MinLength(1)
  name: string

  @IsString()
  @MinLength(1)
  country: string

  @IsString()
  @MinLength(1)
  city: string

  @IsString()
  @MinLength(1)
  address: string

  @IsString()
  @MinLength(1)
  postalCode: string
}
