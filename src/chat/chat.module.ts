import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatEvents } from './chat.events';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Message]),

    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const raw = cfg.get<string>('JWT_EXPIRES_IN');
        // number -> segundos; string -> formatos tipo '7d', '12h', etc.
        const expiresIn: number | import('ms').StringValue = (() => {
          if (!raw) return '7d';
          const n = Number(raw);
          return Number.isFinite(n) ? n : (raw as import('ms').StringValue);
        })();

        return {
          global: false,
          secret: cfg.get<string>('JWT_SECRET') ?? 'supersecret',
          signOptions: { expiresIn },
        };
      },
    }),
  ],
  providers: [ChatService, ChatGateway, ChatEvents],
  controllers: [ChatController],
  exports: [TypeOrmModule],
})
export class ChatModule {}
