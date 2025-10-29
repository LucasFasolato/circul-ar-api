// src/items/dto/query-items.dto.ts
import { IsInt, IsOptional, IsString, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryItemsDto {
  @IsOptional() @IsString() q?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() condition?: string;
  @IsOptional() @IsString() ownerId?: string;

  @IsOptional() @Type(() => Number) @IsInt() @Min(0) minPrice?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) maxPrice?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit?: number;

  @IsOptional() @IsIn(['createdAt', 'price', 'title']) sortBy?:
    | 'createdAt'
    | 'price'
    | 'title';
  @IsOptional() @IsIn(['ASC', 'DESC']) order?: 'ASC' | 'DESC';
}
