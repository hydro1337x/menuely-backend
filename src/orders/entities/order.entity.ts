import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'
import { OrderedProduct } from './ordered-product.entity'

@Entity()
export class Order extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  restaurantId: number

  @Column()
  employerName: string

  @Column()
  customerName: string

  @Column({ nullable: true })
  employeeName: string

  @Column()
  userId: number

  @Column()
  tableId: number

  @Column({ type: 'float' })
  totalPrice: number

  @Column()
  currency: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @OneToMany(() => OrderedProduct, (orderedProduct) => orderedProduct.order)
  orderedProducts: OrderedProduct[]
}
