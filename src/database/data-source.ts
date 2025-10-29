import 'dotenv/config';
import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: Number(process.env.DB_PORT ?? '5432'),
  username: process.env.DB_USER ?? 'circul',
  password: process.env.DB_PASS ?? 'circul',
  database: process.env.DB_NAME ?? 'circul_ar',
  entities: ['src/**/entities/*.{entity.ts,entity.js}'],
  migrations: ['src/database/migrations/*.{ts,js}'],
  synchronize: false, // para migraciones, siempre false
  logging: true,
});
