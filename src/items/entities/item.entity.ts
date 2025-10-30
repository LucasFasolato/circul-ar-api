import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ItemImage } from './item-image.entity';

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column() title: string;
  @Column({ type: 'int' }) price: number;

  // (opcional) si agregaste estos campos antes
  @Column({ default: 'ropa' }) category: 'ropa' | 'accesorios' | 'calzado';
  @Column({ default: 'usado' }) condition: 'nuevo' | 'usado';
  @Column({ type: 'text', nullable: true }) description?: string;

  @Column({ nullable: true }) ownerId?: string;

  @OneToMany(() => ItemImage, (img) => img.item, { cascade: true })
  images: ItemImage[];

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
