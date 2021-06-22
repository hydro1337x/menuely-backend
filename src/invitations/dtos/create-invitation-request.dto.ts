import { Transform } from 'class-transformer'
import { IsNumber, NotEquals } from 'class-validator'

export class CreateInvitationRequestDto {
  @Transform((data) => parseInt(data.value))
  @IsNumber()
  @NotEquals(0)
  employeeId: number
}
