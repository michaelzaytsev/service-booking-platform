import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterReq {
  @IsEmail()
  email!: string;

  @MinLength(6)
  password!: string;

  @IsNotEmpty()
  firstName!: string;

  @IsNotEmpty()
  lastName!: string;

  @IsNotEmpty()
  phone!: string;

  @IsNotEmpty()
  countryCode!: string;
}
