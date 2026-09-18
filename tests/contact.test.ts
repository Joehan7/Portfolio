import { describe, it, expect } from 'vitest';
import { contactSchema } from '@/lib/contact';
import { POST } from '@/app/api/contact/route';
const data = {
  name: 'Test Person',
  email: 'test@example.com',
  message: 'A local validation test.',
  website: '',
};
const req = (payload: unknown, origin = 'http://localhost:3000') =>
  new Request('http://localhost:3000/api/contact', {
    method: 'POST',
    headers: { origin, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
describe('contact validation and safe failure', () => {
  it('accepts valid data', () => expect(contactSchema.safeParse(data).success).toBe(true));
  it('rejects invalid email and oversized messages', () => {
    expect(contactSchema.safeParse({ ...data, email: 'invalid' }).success).toBe(false);
    expect(contactSchema.safeParse({ ...data, message: 'x'.repeat(5001) }).success).toBe(false);
  });
  it('rejects cross-origin requests', async () =>
    expect((await POST(req(data, 'https://example.com'))).status).toBe(403));
  it('rejects an oversized body', async () =>
    expect((await POST(req({ ...data, message: 'x'.repeat(17000) }))).status).toBe(413));
  it('silently discards honeypots', async () =>
    expect((await POST(req({ ...data, website: 'spam' }))).status).toBe(200));
  it('does not claim delivery without credentials', async () => {
    delete process.env.RESEND_API_KEY;
    expect((await POST(req(data))).status).toBe(503);
  });
});
