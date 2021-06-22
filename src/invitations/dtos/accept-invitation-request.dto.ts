import { Transform } from 'class-transformer'
import { IsNumber, NotEquals } from 'class-validator'

export class AcceptInvitationRequestDto {
  @Transform((data) => parseInt(data.value))
  @IsNumber()
  @NotEquals(0)
  invitationId: number

  @Transform((data) => parseInt(data.value))
  @IsNumber()
  @NotEquals(0)
  employerId: number
}
