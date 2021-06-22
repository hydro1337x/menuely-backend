import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm'

@Entity()
export class Invite extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  invitedUserId: number

  @Column()
  employerRestaurantId: number
}
