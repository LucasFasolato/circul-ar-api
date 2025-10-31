import {
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { ChatEvents } from './chat.events';
import { ChatService } from './chat.service';

interface JwtPayload {
  sub: string;
  email?: string;
}

@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: true, credentials: true },
})
@Injectable()
export class ChatGateway implements OnGatewayInit, OnGatewayConnection {
  private server!: Server;
  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly jwt: JwtService,
    private readonly events: ChatEvents,
    private readonly chat: ChatService, // ⬅️ inyectamos service
  ) {}

  afterInit(server: Server): void {
    this.server = server;
    this.events.setServer(server);
    this.logger.log('✅ ChatGateway initialized');
  }

  async handleConnection(client: Socket): Promise<void> {
    const token =
      ((client.handshake?.auth as Record<string, unknown>)?.token as
        | string
        | undefined) ??
      (client.handshake?.query?.token as string | undefined) ??
      (client.handshake?.headers?.authorization || '').replace('Bearer ', '');

    try {
      if (!token) throw new Error('Missing token');
      const payload = await this.jwt.verifyAsync<JwtPayload>(token, {
        secret: process.env.JWT_SECRET ?? 'supersecret',
      });
      (client.data as Record<string, unknown>).userId = payload.sub;
      this.logger.log(`🟢 Socket connected: ${client.id} user=${payload.sub}`);
    } catch {
      this.logger.warn(`🔴 Socket rejected: ${client.id}`);
      client.disconnect(true);
    }
  }

  @SubscribeMessage('conversation:join')
  onJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    if (!data?.conversationId) return;
    const room = this.events.room(data.conversationId);
    client.join(room);
    client.emit('conversation:joined', { conversationId: data.conversationId });
    this.logger.log(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      `🟡 User ${String(client.data.userId)} joined room ${room}`,
    );
  }

  // 🔔 NUEVO: marcar leído vía WS
  @SubscribeMessage('message:read')
  async onRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = client.data.userId as string | undefined;
    if (!userId || !data?.conversationId) return;
    await this.chat.markAsRead(data.conversationId, userId); // emit lo hace el service
  }
}
