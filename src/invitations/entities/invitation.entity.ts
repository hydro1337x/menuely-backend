import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Invitation extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  employeeId: number

  @Column()
  employerId: number
}
