import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { AuthRequest } from './auth.types';
import { UsersService } from '../users/users.service';
import { User } from 'src/users/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private users: UsersService,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(
    @Req() req: AuthRequest,
  ): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await this.users.findById(req.user!.userId);
    if (!user) return null;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const safeUser = (({ passwordHash, ...rest }) => rest)(user);
    return safeUser;
  }
}
