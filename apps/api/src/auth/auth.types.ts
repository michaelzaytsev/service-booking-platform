import { UserRole } from '@sbp/prisma';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}
