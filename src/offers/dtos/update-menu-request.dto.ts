import { IsOptional, IsString } from 'class-validator'

export class UpdateMenuRequestDto {
  @IsOptional()
  @IsString()
  name: string

  @IsOptional()
  @IsString()
  description: string

  @IsOptional()
  @IsString()
  currency: string
}
