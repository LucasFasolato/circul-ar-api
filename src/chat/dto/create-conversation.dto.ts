import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateConversationDto {
  @IsUUID()
  @IsNotEmpty()
  sellerId: string;

  @IsUUID()
  @IsNotEmpty()
  itemId: string;
}
