import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UserService } from './user.service';

@Global()
@Module({
  providers: [PrismaService, UserService],
  exports: [PrismaService, UserService],
})
export class PrismaModule {}
