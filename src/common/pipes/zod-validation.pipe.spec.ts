import { ZodValidationPipe } from './zod-validation.pipe';
import { LoginSchema } from '../../auth/dto/login.dto';

describe('ZodValidationPipe', () => {
  it('should be defined', () => {
    expect(new ZodValidationPipe(LoginSchema)).toBeDefined();
  });
});
