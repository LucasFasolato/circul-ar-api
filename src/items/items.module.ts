import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from './entities/item.entity';
import { ItemImage } from './entities/item-image.entity';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    TypeOrmModule.forFeature([Item, ItemImage]),
    // configuración básica: destino ./uploads
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [ItemsController],
  providers: [ItemsService],
})
export class ItemsModule {}
