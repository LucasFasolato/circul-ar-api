import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  IsIn,
} from 'class-validator';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsInt()
  @Min(0)
  price: number;

  @IsOptional()
  @IsIn(['ropa', 'accesorios', 'calzado'])
  category?: 'ropa' | 'accesorios' | 'calzado';

  @IsOptional()
  @IsIn(['nuevo', 'usado'])
  condition?: 'nuevo' | 'usado';

  @IsOptional()
  @IsString()
  description?: string;
}
