import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { Item } from '../../items/entities/item.entity';
import { User } from '../../users/entities/user.entity';

@Entity('favorites')
@Unique(['user', 'item'])
export class Favorite {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', eager: false })
  user: User;

  @ManyToOne(() => Item, { onDelete: 'CASCADE', eager: true })
  item: Item;

  @CreateDateColumn() createdAt: Date;
}
