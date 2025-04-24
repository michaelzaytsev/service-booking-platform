import { IsEmail, MinLength } from 'class-validator';

export class LoginReq {
  @IsEmail()
  email!: string;

  @MinLength(6)
  password!: string;
}
