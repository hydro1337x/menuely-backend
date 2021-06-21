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
import { Menu } from './menu.entity'
import { Product } from './product.entity'

@Entity()
export class Category extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column()
  currency: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @Column()
  restaurantId: number

  @OneToOne(() => Image)
  @JoinColumn()
  image: Image

  @ManyToOne(() => Menu, (menu) => menu.categories)
  menu: Menu

  @OneToMany(() => Product, (product) => product.category, { nullable: true })
  products: Product[]
}
