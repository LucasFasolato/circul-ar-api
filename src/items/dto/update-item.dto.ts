import { PartialType } from '@nestjs/mapped-types';
import { CreateItemDto } from './create-item.dto';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
export class UpdateItemDto extends PartialType(CreateItemDto) {}
