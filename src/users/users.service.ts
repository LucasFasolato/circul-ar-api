import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {}

  /** Busca por email (sin passwordHash) */
  findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  /** Busca por email incluyendo passwordHash (para login) */
  findByEmailWithSecret(email: string): Promise<User | null> {
    return this.repo
      .createQueryBuilder('u')
      .where('u.email = :email', { email })
      .addSelect('u.passwordHash') // <-- sólo acá traemos el hash
      .getOne();
  }

  /** Busca por id (sin passwordHash) */
  findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  /** Crea usuario (guarda passwordHash) */
  async create(data: {
    name: string;
    email: string;
    passwordHash: string;
  }): Promise<User> {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }
}
