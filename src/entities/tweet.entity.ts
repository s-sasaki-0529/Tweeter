import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { User } from './user.entity'

@Entity()
export class Tweet extends BaseEntity {
  @PrimaryGeneratedColumn()
  readonly id!: number

  @Column()
  text!: string

  @ManyToOne(_ => User, user => user.tweets, { onDelete: 'CASCADE' })
  user!: User

  @CreateDateColumn()
  readonly createdAt!: Date
}
