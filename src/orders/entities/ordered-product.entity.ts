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
import { Order } from './order.entity'
import { Image } from '../../files/entities/image.entity'

@Entity()
export class OrderedProduct extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column()
  orderedProductId: number

  @Column()
  quantity: number

  @Column({ type: 'float' })
  price: number

  @Column()
  imageUrl: string

  @Column()
  description: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @ManyToOne(() => Order, (order) => order.orderedProducts)
  order: Order
}
