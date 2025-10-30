import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Req,
  Put,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthRequest } from '../auth/auth.types';
import { QueryItemsDto } from './dto/query-items.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { JwtOptionalAuthGuard } from '../auth/jwt-optional.guard';

@Controller('items')
export class ItemsController {
  constructor(private readonly items: ItemsService) {}

  // GET /items → devuelve cada item con { favorite: boolean } si hay JWT
  @UseGuards(JwtOptionalAuthGuard)
  @Get()
  findAll(@Query() query: QueryItemsDto, @Req() req: AuthRequest) {
    const currentUserId = req.user?.userId;
    return this.items.findAll(query, currentUserId);
  }

  // GET /items/:id → idem, con flag favorite
  @UseGuards(JwtOptionalAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: AuthRequest) {
    const currentUserId = req.user?.userId;
    return this.items.findOneWithFavorite(id, currentUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateItemDto, @Req() req: AuthRequest) {
    const ownerId = req.user?.userId;
    return this.items.create({ ...dto, ownerId });
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateItemDto) {
    return this.items.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  replace(@Param('id') id: string, @Body() dto: UpdateItemDto) {
    return this.items.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.items.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/images')
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads'),
        filename: (req, file, cb) => {
          const ext = extname(file.originalname || '').toLowerCase();
          const safeExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(
            ext,
          )
            ? ext
            : '.jpg';
          const name = randomUUID() + safeExt;
          cb(null, name);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file || typeof file.mimetype !== 'string') {
          return cb(new Error('Invalid file'), false);
        }
        if (file.mimetype.startsWith('image/')) {
          return cb(null, true);
        }
        return cb(new Error('Only image files are allowed'), false);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  uploadImages(
    @Param('id') id: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return this.items.addImages(id, files);
  }

  @Get(':id/images')
  listImages(@Param('id') id: string) {
    return this.items.findImages(id);
  }
}
