import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'
import * as bcrypt from 'bcrypt'
import { RefreshToken } from '../../auth/entities/refresh-token.entity'

@Entity()
export class Restaurant extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  email: string

  @Column()
  password: string

  @Column()
  name: string

  @Column()
  country: string

  @Column()
  city: string

  @Column()
  address: string

  @Column()
  postalCode: string

  @Column()
  salt: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.restaurant)
  refreshTokens: RefreshToken[]
}
