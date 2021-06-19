import { IsNotEmpty, IsOptional } from 'class-validator'

export class UpdateUserProfileRequestDto {
  @IsOptional()
  @IsNotEmpty()
  firstname: string

  @IsOptional()
  @IsNotEmpty()
  lastname: string
}
