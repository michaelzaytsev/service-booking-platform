import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@sbp/prisma';
import * as bcrypt from 'bcrypt';
import { UserService } from '../prisma/user.service';
import { RegisterReq } from './req';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private users: UserService,
  ) {}

  async register(dto: RegisterReq) {
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.users.create({
      email: dto.email,
      name: dto.firstName + ' ' + dto.lastName,
      phone: dto.phone,
      countryCode: dto.countryCode,
      password: passwordHash,
    });
    return this.generateAndUpdateTokens(user);
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    return this.generateAndUpdateTokens(user);
  }

  async refresh(userId: string, refreshToken: string) {
    const user = await this.users.findById(userId);

    if (!user || !user.refreshTokenHash) throw new ForbiddenException('Access Denied');

    const isMatch = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isMatch) throw new ForbiddenException('Invalid token');

    return this.generateAndUpdateTokens(user);
  }

  async logout(userId: string) {
    await this.users.update(userId, { refreshTokenHash: null });
  }

  private async generateAndUpdateTokens(user: Prisma.UserGetPayload<{}>) {
    const tokens = await this.generateTokens(user);
    const refreshTokenHash = await this.hashRefreshToken(tokens.refreshToken);
    await this.users.update(user.id, { refreshTokenHash });
    return tokens;
  }

  private async generateTokens(user: Prisma.UserGetPayload<{}>) {
    const payload = { sub: user.id, role: user.role };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  private hashRefreshToken(refreshToken: string) {
    return bcrypt.hash(refreshToken, 10);
  }

  private async validateUser(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }
}
