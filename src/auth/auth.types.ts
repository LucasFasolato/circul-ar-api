import { Request } from 'express';

export interface JwtUser {
  userId: string;
  email: string;
}

export type AuthRequest = Request & { user?: JwtUser };
