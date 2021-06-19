import { IsIn } from 'class-validator'
import { UserImageKind } from '../enums/user-image-kind.enum'

export class UpdateUserImageRequestDto {
  @IsIn([UserImageKind.PROFILE, UserImageKind.COVER])
  kind: UserImageKind
}
