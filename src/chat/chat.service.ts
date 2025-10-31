import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { ChatEvents } from './chat.events';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private readonly convRepo: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly msgRepo: Repository<Message>,
    private readonly events: ChatEvents,
  ) {}

  // 🔹 Crear o recuperar conversación existente
  async createOrGetConversation(buyerId: string, dto: CreateConversationDto) {
    const { sellerId, itemId } = dto;

    if (buyerId === sellerId) {
      throw new ForbiddenException('Cannot create conversation with yourself');
    }

    let conv = await this.convRepo.findOne({
      where: { buyerId, sellerId, itemId },
    });
    if (!conv) {
      conv = this.convRepo.create({
        buyerId,
        sellerId,
        itemId,
        lastMessageAt: new Date(),
      });
      conv = await this.convRepo.save(conv);
    }

    return conv;
  }

  // 🔹 Listar mis conversaciones (como comprador o vendedor)
  async listMyConversations(userId: string) {
    return this.convRepo.find({
      where: [{ buyerId: userId }, { sellerId: userId }],
      order: { lastMessageAt: 'DESC' },
    });
  }

  // 🔹 Validar que el usuario participa de la conversación
  async assertParticipant(conversationId: string, userId: string) {
    const conv = await this.convRepo.findOne({ where: { id: conversationId } });
    if (!conv) throw new NotFoundException('Conversation not found');
    if (conv.buyerId !== userId && conv.sellerId !== userId) {
      throw new ForbiddenException('Not a participant of this conversation');
    }
    return conv;
  }

  // 🔹 Obtener mensajes de una conversación (paginados)
  async getMessages(
    conversationId: string,
    userId: string,
    page = 1,
    limit = 20,
  ) {
    await this.assertParticipant(conversationId, userId);

    const take = Math.min(Math.max(limit, 1), 100);
    const skip = (Math.max(page, 1) - 1) * take;

    const [rows, total] = await this.msgRepo.findAndCount({
      where: { conversationId },
      order: { createdAt: 'DESC' },
      take,
      skip,
    });

    return {
      data: rows.reverse(), // orden cronológico ascendente
      meta: {
        total,
        page,
        limit: take,
        pages: Math.ceil(total / take),
      },
    };
  }

  // 🔹 Enviar mensaje
  async postMessage(
    conversationId: string,
    senderId: string,
    dto: CreateMessageDto,
  ) {
    const conv = await this.assertParticipant(conversationId, senderId);

    const msg = this.msgRepo.create({
      conversationId,
      senderId,
      body: dto.body,
      type: dto.type ?? 'text',
    });
    const saved = await this.msgRepo.save(msg);

    // Actualizar fecha de último mensaje
    await this.convRepo.update(
      { id: conv.id },
      { lastMessageAt: saved.createdAt },
    );

    // Emitir WS
    this.events.emitNewMessage(conversationId, {
      conversationId,
      message: {
        id: saved.id,
        senderId: saved.senderId,
        body: saved.body,
        type: saved.type,
        createdAt: saved.createdAt,
      },
    });

    return saved;
  }

  // 🔹 Marcar como leídos los mensajes del otro usuario
  async markAsRead(conversationId: string, userId: string) {
    await this.assertParticipant(conversationId, userId);

    const now = new Date();
    const result = await this.msgRepo.update(
      { conversationId, senderId: Not(userId), readAt: IsNull() },
      { readAt: now },
    );

    // Emitir evento WS para actualizar en tiempo real
    this.events.emitRead(conversationId, {
      conversationId,
      userId,
      readAt: now.toISOString(),
    });

    return { updated: result.affected ?? 0, readAt: now.toISOString() };
  }

  // 🔹 Leer y marcar automáticamente como leídos
  async getMessagesAndMarkRead(
    conversationId: string,
    userId: string,
    page = 1,
    limit = 20,
  ) {
    const res = await this.getMessages(conversationId, userId, page, limit);
    await this.markAsRead(conversationId, userId);
    return res;
  }
}
