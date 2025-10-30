import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthRequest } from '../auth/auth.types';

@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favs: FavoritesService) {}

  @Get()
  listMine(@Req() req: AuthRequest) {
    return this.favs.listMine(req.user!.userId);
  }

  @Post(':itemId')
  add(@Param('itemId') itemId: string, @Req() req: AuthRequest) {
    return this.favs.add(req.user!.userId, itemId);
  }

  @Delete(':itemId')
  remove(@Param('itemId') itemId: string, @Req() req: AuthRequest) {
    return this.favs.remove(req.user!.userId, itemId);
  }

  @Get(':itemId/check')
  check(@Param('itemId') itemId: string, @Req() req: AuthRequest) {
    return this.favs.isFavorite(req.user!.userId, itemId);
  }
}
