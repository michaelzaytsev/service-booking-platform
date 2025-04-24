import { IsJWT } from 'class-validator';

export class RefreshReq {
  @IsJWT()
  refreshToken!: string;
}
