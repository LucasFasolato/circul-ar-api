import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('conversations')
@Index(['buyerId', 'sellerId', 'itemId'], { unique: true })
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  buyerId: string;

  @Column()
  sellerId: string;

  @Column()
  itemId: string;

  @Column({ type: 'timestamptz', nullable: true })
  lastMessageAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
