import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { Item } from '../items/entities/item.entity';
import { User } from '../users/entities/user.entity';

type FavoriteLean = { item: Item; createdAt: Date };

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite) private readonly favRepo: Repository<Favorite>,
    @InjectRepository(Item) private readonly itemRepo: Repository<Item>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  /** Agrega (idempotente) y devuelve sólo lo necesario para el front */
  async add(userId: string, itemId: string): Promise<FavoriteLean> {
    const [user, item] = await Promise.all([
      this.userRepo.findOne({ where: { id: userId } }),
      this.itemRepo.findOne({ where: { id: itemId } }),
    ]);
    if (!user) throw new NotFoundException('User not found');
    if (!item) throw new NotFoundException('Item not found');

    const existing = await this.favRepo.findOne({
      where: { user: { id: userId }, item: { id: itemId } },
    });
    if (existing) {
      return { item: existing.item, createdAt: existing.createdAt };
    }

    const saved = await this.favRepo.save(this.favRepo.create({ user, item }));
    return { item: saved.item, createdAt: saved.createdAt };
  }

  /** Elimina si existe (idempotente) */
  async remove(userId: string, itemId: string): Promise<{ removed: boolean }> {
    const fav = await this.favRepo.findOne({
      where: { user: { id: userId }, item: { id: itemId } },
    });
    if (!fav) return { removed: false };
    await this.favRepo.remove(fav);
    return { removed: true };
  }

  /** Lista mis favoritos devolviendo sólo los ítems */
  async listMine(userId: string): Promise<Item[]> {
    const rows = await this.favRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
    return rows.map((f) => f.item);
  }

  /** Chequea si un ítem es favorito del usuario */
  async isFavorite(
    userId: string,
    itemId: string,
  ): Promise<{ itemId: string; favorite: boolean }> {
    const favorite = await this.favRepo.exist({
      where: { user: { id: userId }, item: { id: itemId } },
    });
    return { itemId, favorite };
  }
}
