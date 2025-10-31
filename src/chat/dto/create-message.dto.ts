import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  body: string;

  @IsIn(['text', 'image'])
  type: 'text' | 'image' = 'text';
}
