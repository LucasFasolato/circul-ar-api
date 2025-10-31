import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

type JwtPayload = { sub: string; email: string };

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
  ) {}

  async register(data: { name: string; email: string; password: string }) {
    const exists = await this.users.findByEmail(data.email);
    if (exists) throw new BadRequestException('Email already in use');

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await this.users.create({
      name: data.name,
      email: data.email,
      passwordHash,
    });

    return this.signToken(user.id, user.email);
  }

  async login(data: { email: string; password: string }) {
    const user = await this.users.findByEmailWithSecret(data.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(data.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    return this.signToken(user.id, user.email);
  }

  private signToken(userId: string, email: string) {
    const payload: JwtPayload = { sub: userId, email };
    const access_token = this.jwt.sign(payload);
    return { access_token };
  }
}
