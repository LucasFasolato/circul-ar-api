import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthRequest } from '../auth/auth.types';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';

@UseGuards(JwtAuthGuard)
@Controller('conversations')
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  // 🔹 Crear o recuperar una conversación (por buyer-seller-item)
  @Post()
  createConversation(
    @Req() req: AuthRequest,
    @Body() dto: CreateConversationDto,
  ) {
    const buyerId = req.user!.userId;
    return this.chat.createOrGetConversation(buyerId, dto);
  }

  // 🔹 Listar mis conversaciones
  @Get()
  listMyConversations(@Req() req: AuthRequest) {
    const userId = req.user!.userId;
    return this.chat.listMyConversations(userId);
  }

  // 🔹 Obtener mensajes de una conversación (con soporte a ?markRead=true)
  @Get(':id/messages')
  async getMessages(
    @Param('id') id: string,
    @Req() req: AuthRequest,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('markRead') markRead = 'false',
  ) {
    const userId = req.user!.userId;
    const p = Number(page) || 1;
    const l = Number(limit) || 20;

    if (markRead === 'true') {
      return this.chat.getMessagesAndMarkRead(id, userId, p, l);
    }
    return this.chat.getMessages(id, userId, p, l);
  }

  // 🔹 Enviar mensaje (crea y emite por WS)
  @Post(':id/messages')
  postMessage(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: CreateMessageDto,
  ) {
    const senderId = req.user!.userId;
    return this.chat.postMessage(id, senderId, dto);
  }

  // 🔹 Marcar mensajes como leídos (vía REST)
  @Post(':id/read')
  async markRead(@Param('id') id: string, @Req() req: AuthRequest) {
    const userId = req.user!.userId;
    return this.chat.markAsRead(id, userId);
  }
}
