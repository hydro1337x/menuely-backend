import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'
import { RefreshToken } from '../../tokens/entities/refresh-token.entity'
import { Image } from '../../files/entities/image.entity'
import { Restaurant } from '../../restaurants/entities/restaurant.entity'

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  email: string

  @Column()
  password: string

  @Column()
  firstname: string

  @Column()
  lastname: string

  @Column({ default: false })
  isVerified: boolean

  @Column()
  passwordSalt: string

  @Column({ nullable: true })
  refreshTokenSalt: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.employees, {
    nullable: true
  })
  employer: Restaurant

  @OneToOne(() => Image, { nullable: true })
  @JoinColumn()
  profileImage: Image

  @OneToOne(() => Image, { nullable: true })
  @JoinColumn()
  coverImage: Image

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user, {
    cascade: true
  })
  refreshTokens: RefreshToken[]
}
