import { IsBoolean, IsOptional, IsString } from 'class-validator'

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

  @IsOptional()
  @IsBoolean()
  isActive: boolean
}
