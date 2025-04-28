import { ForbiddenException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { User } from '@sbp/types';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../prisma/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private users: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: String(process.env.JWT_SECRET),
    });
  }

  async validate(payload: { sub: string; role: string }): Promise<User> {
    const user = await this.users.findById(payload.sub);
    if (!user || !user.refreshTokenHash) {
      throw new ForbiddenException('Access Denied');
    }
    return user;
  }
}
