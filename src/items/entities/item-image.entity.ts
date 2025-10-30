import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Item } from './item.entity';

@Entity('item_images')
export class ItemImage {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column() filename: string; // nombre físico en /uploads
  @Column() url: string; // URL pública servida por ServeStatic (/uploads/filename)

  @ManyToOne(() => Item, (item) => item.images, { onDelete: 'CASCADE' })
  item: Item;

  @CreateDateColumn() createdAt: Date;
}
