import { RegisterReq } from '../../src/auth/req';

export const registerReqMock: RegisterReq = {
  email: 'test@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe',
  phone: '+1 (509) 123-4567',
  countryCode: 'US',
};
