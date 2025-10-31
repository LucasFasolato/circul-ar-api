import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export type MessageType = 'text' | 'image';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  conversationId: string;

  @Column()
  senderId: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'varchar', length: 16, default: 'text' })
  type: MessageType;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  readAt?: Date;
}
