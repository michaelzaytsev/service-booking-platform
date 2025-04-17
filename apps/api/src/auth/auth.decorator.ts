import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { UserRole } from '@sbp/prisma';
import { JwtGuard } from './jwt.guard';
import { RolesGuard, ROLES_KEY } from './roles.guard';

export function Auth(...roles: UserRole[]) {
  return applyDecorators(SetMetadata(ROLES_KEY, roles), UseGuards(JwtGuard, RolesGuard));
}
