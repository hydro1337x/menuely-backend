import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'
import { RefreshToken } from '../../tokens/entities/refresh-token.entity'
import { Image } from '../../files/entities/image.entity'
import { Menu } from '../../offers/entities/menu.entity'
import { User } from '../../users/entities/user.entity'
import { int } from 'aws-sdk/clients/datapipeline'

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
  description: string

  @Column()
  country: string

  @Column()
  city: string

  @Column()
  address: string

  @Column()
  postalCode: string

  @Column({ default: false })
  isVerified: boolean

  @Column({ nullable: true })
  activeMenuId: number

  @Column()
  passwordSalt: string

  @Column({ nullable: true })
  refreshTokenSalt: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @OneToMany(() => Menu, (menu) => menu.restaurant, { nullable: true })
  menus: Menu[]

  @OneToMany(() => User, (user) => user.employer, { nullable: true })
  employees: User[]

  @OneToOne(() => Image, { nullable: true })
  @JoinColumn()
  profileImage: Image

  @OneToOne(() => Image, { nullable: true })
  @JoinColumn()
  coverImage: Image

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.restaurant, {
    cascade: true
  })
  refreshTokens: RefreshToken[]
}
