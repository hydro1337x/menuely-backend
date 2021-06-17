import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm'
import { User } from '../../users/entities/user.entity'
import { Restaurant } from '../../restaurants/entities/restaurant.entity'

@Entity()
export class RefreshToken extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  hash: string

  @ManyToOne(() => User, (user) => user.refreshTokens, { onDelete: 'CASCADE' })
  user: User

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.refreshTokens, {
    onDelete: 'CASCADE'
  })
  restaurant: Restaurant
}
