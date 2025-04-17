import { Controller, Post, Body, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, RefreshDto, LoginDto } from './dto';
import { Auth } from './auth.decorator';
import { JwtPayload } from './auth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('refresh')
  @Auth()
  refresh(@Req() req: Request & { user: JwtPayload }, @Body() dto: RefreshDto) {
    return this.authService.refresh(req.user.sub, dto.refreshToken);
  }

  @Post('logout')
  @Auth()
  logout(@Req() req: Request & { user: JwtPayload }) {
    return this.authService.logout(req.user.sub);
  }
}
