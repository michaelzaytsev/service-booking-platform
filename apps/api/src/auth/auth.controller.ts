import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { Auth } from './auth.decorator';
import { AuthService } from './auth.service';
import { JwtPayload } from './auth.types';
import { LoginReq, RefreshReq, RegisterReq } from './req';
import { TokensRes } from './res/tokens.res';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterReq): Promise<TokensRes> {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginReq): Promise<TokensRes> {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('refresh')
  @Auth()
  @HttpCode(HttpStatus.OK)
  refresh(@Req() req: Request & { user: JwtPayload }, @Body() dto: RefreshReq): Promise<TokensRes> {
    return this.authService.refresh(req.user.sub, dto.refreshToken);
  }

  @Post('logout')
  @Auth()
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Req() req: Request & { user: JwtPayload }): Promise<void> {
    return this.authService.logout(req.user.sub);
  }
}
