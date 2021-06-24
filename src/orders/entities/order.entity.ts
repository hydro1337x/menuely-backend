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
  tableId: number

  @Column({ type: 'float' })
  totalPrice: number

  @Column()
  client: string

  @Column({ default: false })
  isAccepted: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @OneToMany(() => OrderedProduct, (orderedProduct) => orderedProduct.order)
  orderedProducts: OrderedProduct[]
}
