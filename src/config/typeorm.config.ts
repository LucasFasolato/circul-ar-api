import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const typeormConfig = (cfg: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: cfg.get<string>('DB_HOST', '127.0.0.1'),
  port: Number(cfg.get<string>('DB_PORT', '5432')),
  username: cfg.get<string>('DB_USER', 'circul'),
  password: cfg.get<string>('DB_PASS', 'circul'),
  database: cfg.get<string>('DB_NAME', 'circul_ar'),
  autoLoadEntities: true,
  synchronize: true, // ⚠️ solo en desarrollo; luego poner false y usar migraciones
  logging: true,
});
