import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './entities/item.entity';
import { QueryItemsDto } from './dto/query-items.dto';
import { ItemImage } from './entities/item-image.entity';
import type { Express } from 'express';

export type ItemWithFavorite = Item & { favorite: boolean };
type RawRow = { is_favorite?: boolean | number | null };

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item) private readonly repo: Repository<Item>,
    @InjectRepository(ItemImage)
    private readonly imgRepo: Repository<ItemImage>,
  ) {}

  async findAll(
    query: QueryItemsDto,
    currentUserId?: string,
  ): Promise<{
    data: ItemWithFavorite[];
    meta: {
      total: number;
      page: number;
      limit: number;
      pages: number;
      sortBy: 'createdAt' | 'price' | 'title';
      order: 'ASC' | 'DESC';
    };
  }> {
    const {
      q,
      category,
      condition,
      ownerId,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'DESC',
    } = query;

    const qb = this.repo.createQueryBuilder('i');

    // Filtros
    if (q)
      qb.andWhere('(i.title ILIKE :q OR i.description ILIKE :q)', {
        q: `%${q}%`,
      });
    if (category) qb.andWhere('i.category = :category', { category });
    if (condition) qb.andWhere('i.condition = :condition', { condition });
    if (ownerId) qb.andWhere('i.ownerId = :ownerId', { ownerId });
    if (minPrice != null) qb.andWhere('i.price >= :minPrice', { minPrice });
    if (maxPrice != null) qb.andWhere('i.price <= :maxPrice', { maxPrice });

    // Join opcional a favoritos para calcular boolean
    if (currentUserId) {
      qb.leftJoin('favorites', 'f', 'f."itemId" = i.id AND f."userId" = :uid', {
        uid: currentUserId,
      });
      qb.addSelect(
        'CASE WHEN f.id IS NOT NULL THEN TRUE ELSE FALSE END',
        'is_favorite',
      );
    } else {
      qb.addSelect('FALSE', 'is_favorite');
    }

    // Orden seguro
    let safeSort: 'createdAt' | 'price' | 'title' = 'createdAt';
    if (sortBy === 'createdAt' || sortBy === 'price' || sortBy === 'title') {
      safeSort = sortBy;
    }

    const safeOrder: 'ASC' | 'DESC' = order === 'ASC' ? 'ASC' : 'DESC';
    qb.orderBy(`i.${safeSort}`, safeOrder);
    // Paginación
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
    const safePage = Math.max(Number(page) || 1, 1);
    qb.skip((safePage - 1) * safeLimit).take(safeLimit);

    // Datos + columna calculada
    const [rawAndEntities, total] = await Promise.all([
      qb.getRawAndEntities<RawRow>(),
      qb.getCount(),
    ]);

    const { raw, entities } = rawAndEntities;

    const data: ItemWithFavorite[] = entities.map((ent, idx) => {
      const favorite = !!raw[idx]?.is_favorite;
      return { ...ent, favorite };
    });
    return {
      data,
      meta: {
        total,
        page: safePage,
        limit: safeLimit,
        pages: Math.ceil(total / safeLimit),
        sortBy: safeSort,
        order: safeOrder,
      },
    };
  }

  async findOne(id: string): Promise<Item> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Item not found');
    return item;
  }

  // GET /items/:id con flag favorite
  async findOneWithFavorite(
    id: string,
    currentUserId?: string,
  ): Promise<ItemWithFavorite> {
    const qb = this.repo.createQueryBuilder('i').where('i.id = :id', { id });

    if (currentUserId) {
      qb.leftJoin('favorites', 'f', 'f."itemId" = i.id AND f."userId" = :uid', {
        uid: currentUserId,
      });
      qb.addSelect(
        'CASE WHEN f.id IS NOT NULL THEN TRUE ELSE FALSE END',
        'is_favorite',
      );
    } else {
      qb.addSelect('FALSE', 'is_favorite');
    }

    const rawAndEnt = await qb.getRawAndEntities<RawRow>();
    const { raw, entities } = rawAndEnt;

    const entity = entities[0];
    if (!entity) throw new NotFoundException('Item not found');

    const favorite = !!raw[0]?.is_favorite;
    return { ...entity, favorite };
  }

  create(dto: {
    title: string;
    price: number;
    ownerId?: string;
    category?: 'ropa' | 'accesorios' | 'calzado';
    condition?: 'nuevo' | 'usado';
    description?: string;
  }) {
    const item = this.repo.create(dto);
    return this.repo.save(item);
  }

  async update(id: string, dto: Partial<Item>) {
    const item = await this.findOne(id);
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async remove(id: string) {
    const item = await this.findOne(id);
    return this.repo.remove(item);
  }

  async addImages(itemId: string, files: Array<Express.Multer.File>) {
    const item = await this.repo.findOne({ where: { id: itemId } });
    if (!item) throw new NotFoundException('Item not found');

    const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000';

    const images = files.map((file: Express.Multer.File) => {
      const filename: string = String(file?.filename ?? '');
      if (!filename) {
        throw new NotFoundException('Invalid file: missing filename');
      }
      return this.imgRepo.create({
        filename,
        url: `${baseUrl}/uploads/${encodeURIComponent(filename)}`,
        item,
      });
    });

    await this.imgRepo.save(images);

    return this.repo.findOne({
      where: { id: itemId },
      relations: ['images'],
    });
  }

  findImages(itemId: string) {
    return this.imgRepo.find({
      where: { item: { id: itemId } },
      order: { createdAt: 'DESC' },
    });
  }
}
