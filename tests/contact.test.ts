import { describe, it, expect } from 'vitest';
import { contactSchema } from '@/lib/contact';
const data = {
  name: 'Test Person',
  email: 'test@example.com',
  message: 'A local validation test.',
  website: '',
};
describe('contact validation and safe failure', () => {
  it('accepts valid data', () => expect(contactSchema.safeParse(data).success).toBe(true));
  it('rejects invalid email and oversized messages', () => {
    expect(contactSchema.safeParse({ ...data, email: 'invalid' }).success).toBe(false);
    expect(contactSchema.safeParse({ ...data, message: 'x'.repeat(5001) }).success).toBe(false);
  });
});
