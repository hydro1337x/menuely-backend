import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'
import { Image } from '../../files/entities/image.entity'
import { Category } from './category.entity'

@Entity()
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column()
  description: string

  @Column()
  price: number

  @Column()
  currency: string

  @Column()
  categoryId: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @OneToOne(() => Image)
  @JoinColumn()
  image: Image

  @ManyToOne(() => Category, (category) => category.products)
  category: Category
}
