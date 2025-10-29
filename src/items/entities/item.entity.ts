import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() title: string;
  @Column({ type: 'int' }) price: number;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
  @Column({ nullable: true })
  @Column({ default: 'ropa' })
  category: 'ropa' | 'accesorios' | 'calzado';
  @Column({ default: 'usado' }) condition: 'nuevo' | 'usado';
  @Column({ type: 'text', nullable: true }) description?: string;
  ownerId: string;
}
