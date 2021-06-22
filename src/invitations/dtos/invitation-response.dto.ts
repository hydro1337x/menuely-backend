import { Expose } from 'class-transformer'

export class InvitationResponseDto {
  @Expose()
  id: number

  @Expose()
  employeeId: number

  @Expose()
  employerId: number
}
