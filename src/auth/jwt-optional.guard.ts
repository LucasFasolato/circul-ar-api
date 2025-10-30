import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtOptionalAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = Record<string, unknown>>(
    err: unknown,
    user: TUser | false | null,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    info?: unknown,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context?: ExecutionContext,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    status?: unknown,
  ): TUser | undefined {
    if (err || !user) return undefined;
    return user;
  }
}
