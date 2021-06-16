import { IsOptional } from 'class-validator'

export class FilterUserRequestDto {
  @IsOptional()
  search: string
}
