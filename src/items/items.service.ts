import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './entities/item.entity';
import { QueryItemsDto } from './dto/query-items.dto';

@Injectable()
export class ItemsService {
  constructor(@InjectRepository(Item) private repo: Repository<Item>) {}

  // src/items/items.service.ts (solo reemplaza findAll)
  async findAll(query: QueryItemsDto) {
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
    if (q) {
      qb.andWhere('(i.title ILIKE :q OR i.description ILIKE :q)', {
        q: `%${q}%`,
      });
    }
    if (category) {
      qb.andWhere('i.category = :category', { category });
    }
    if (condition) {
      qb.andWhere('i.condition = :condition', { condition });
    }
    if (ownerId) {
      qb.andWhere('i.ownerId = :ownerId', { ownerId });
    }
    if (minPrice != null) {
      qb.andWhere('i.price >= :minPrice', { minPrice });
    }
    if (maxPrice != null) {
      qb.andWhere('i.price <= :maxPrice', { maxPrice });
    }

    // Orden seguro (evita SQL injection con una whitelist)
    const allowedSort: Array<'createdAt' | 'price' | 'title'> = [
      'createdAt',
      'price',
      'title',
    ];

    const safeSort = allowedSort.includes(sortBy as any) ? sortBy : 'createdAt';

    const safeOrder = order === 'ASC' ? 'ASC' : 'DESC';
    qb.orderBy(`i.${safeSort}`, safeOrder);

    // Paginación
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
    const safePage = Math.max(Number(page) || 1, 1);
    qb.skip((safePage - 1) * safeLimit).take(safeLimit);

    const [data, total] = await qb.getManyAndCount();

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

  async findOne(id: string) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Item not found');
    return item;
  }

  create(dto: {
    title: string;
    price: number;
    ownerId?: string;
    category?: any;
    condition?: any;
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
}
