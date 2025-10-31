// src/chat/chat.events.ts
import { Injectable, Logger } from '@nestjs/common';
import type { Server } from 'socket.io';

@Injectable()
export class ChatEvents {
  private server?: Server;
  private readonly logger = new Logger(ChatEvents.name);

  setServer(server: Server) {
    this.server = server;
  }

  // público para usarlo desde el gateway si querés
  room(conversationId: string) {
    return `conv:${conversationId}`;
  }

  emitNewMessage(conversationId: string, payload: any) {
    if (!this.server) return;
    this.server.to(this.room(conversationId)).emit('message:new', payload);
  }

  // broadcast de lectura
  emitRead(
    conversationId: string,
    payload: { conversationId: string; userId: string; readAt: string },
  ) {
    if (!this.server) return;
    this.server.to(this.room(conversationId)).emit('message:read', payload);
  }
}
