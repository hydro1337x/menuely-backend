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
import { Image } from '../../files/entities/image.entity'
import { Category } from './category.entity'
import { Restaurant } from '../../restaurants/entities/restaurant.entity'

@Entity()
export class Menu extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column()
  description: string

  @Column()
  currency: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @Column()
  restaurantId: number

  @Column({ default: false })
  isActive: boolean

  @OneToMany(() => Image, (qrCodeImage) => qrCodeImage.menu, { nullable: true })
  qrCodeImages: Image[]

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.menus)
  restaurant: Restaurant

  @OneToMany(() => Category, (category) => category.menu, { nullable: true })
  categories: Category[]
}
