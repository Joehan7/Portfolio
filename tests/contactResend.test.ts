import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST, OPTIONS } from '@/app/api/contact/route';
import { copy } from '@/content/copy';
const { send, allow } = vi.hoisted(() => ({ send: vi.fn(), allow: vi.fn() }));
vi.mock('resend', () => ({
  Resend: class {
    emails = { send };
  },
}));
vi.mock('@/lib/rateLimit', () => ({ allowContact: allow }));
const data = {
  name: 'Test Person',
  email: 'visitor@example.com',
  message: 'A server delivery verification.',
  website: '',
};
const origin = 'https://joehan7.github.io';
const request = (body = data, originValue = origin) =>
  new Request('https://contact.example.com/api/contact', {
    method: 'POST',
    headers: { Origin: originValue, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
const preflight = (originValue = origin, method = 'POST', headers = 'content-type') =>
  new Request('https://contact.example.com/api/contact', {
    method: 'OPTIONS',
    headers: {
      Origin: originValue,
      'Access-Control-Request-Method': method,
      'Access-Control-Request-Headers': headers,
    },
  });
beforeEach(() => {
  vi.stubEnv('GITHUB_PAGES', 'false');
  vi.stubEnv('RESEND_API_KEY', 'test-server-only-key');
  vi.stubEnv('CONTACT_FROM', 'Portfolio <hello@example.com>');
  vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://redis.example.com');
  vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'test-server-only-token');
  vi.stubEnv('VERCEL', '1');
  send.mockReset().mockResolvedValue({ data: { id: 'accepted-id' }, error: null });
  allow.mockReset().mockResolvedValue(true);
});
afterEach(() => vi.unstubAllEnvs());
describe('Resend backend for GitHub Pages', () => {
  it('allows a Pages JSON preflight without delivery or rate-limit charges', async () => {
    const response = await OPTIONS(preflight());
    expect(response.status).toBe(204);
    expect(response.headers.get('access-control-allow-origin')).toBe(origin);
    expect(response.headers.get('access-control-allow-methods')).toBe('POST');
    expect(response.headers.get('access-control-allow-credentials')).toBeNull();
    expect(send).not.toHaveBeenCalled();
    expect(allow).not.toHaveBeenCalled();
  });
  it('rejects arbitrary origins, unsupported preflights, and deceptive origins', async () => {
    for (const value of [
      'https://evil.example.com',
      origin + '.evil.example.com',
      origin + '/Portfolio',
      'null',
    ]) {
      const response = await POST(request(data, value));
      expect(response.status).toBe(403);
      expect(response.headers.get('access-control-allow-origin')).toBeNull();
      expect((await OPTIONS(preflight(value))).status).toBe(403);
    }
    expect((await OPTIONS(preflight(origin, 'DELETE'))).status).toBe(403);
    expect((await OPTIONS(preflight(origin, 'POST', 'authorization'))).status).toBe(403);
    expect(send).not.toHaveBeenCalled();
  });
  it('sends to the fixed recipient with Reply-To only after validation and limiting', async () => {
    const req = request();
    req.headers.set('x-vercel-forwarded-for', '203.0.113.5, 203.0.113.6');
    const response = await POST(req);
    expect(response.status).toBe(200);
    expect(response.headers.get('access-control-allow-origin')).toBe(origin);
    expect(await response.json()).toEqual({ message: copy.contact.success });
    expect(allow).toHaveBeenCalledWith('203.0.113.5');
    expect(send).toHaveBeenCalledWith({
      from: 'Portfolio <hello@example.com>',
      to: 'joehanantony@gmail.com',
      replyTo: data.email,
      subject: copy.contact.title,
      text: [data.name, data.email, '', data.message].join('\n'),
    });
  });
  it('preserves same-origin delivery', async () =>
    expect((await POST(request(data, 'https://contact.example.com'))).status).toBe(200));
  it.each([
    { data: null, error: { message: 'Provider rejection' } },
    { data: null, error: null },
    { data: {}, error: null },
  ])('never accepts a missing or rejected Resend ID', async (result) => {
    send.mockResolvedValue(result);
    const response = await POST(request());
    expect(response.status).toBe(502);
    expect(response.headers.get('access-control-allow-origin')).toBe(origin);
    expect(await response.json()).toEqual({ message: copy.contact.error });
  });
  it('preserves honeypot, validation and body-size checks for cross-origin delivery', async () => {
    expect((await POST(request({ ...data, website: 'spam' }))).status).toBe(200);
    expect((await POST(request({ ...data, email: 'invalid' }))).status).toBe(400);
    expect((await POST(request({ ...data, message: 'x'.repeat(17000) }))).status).toBe(413);
    expect(send).not.toHaveBeenCalled();
  });
  it('returns CORS-readable unavailable errors when secrets are missing', async () => {
    vi.stubEnv('RESEND_API_KEY', '');
    const response = await POST(request());
    expect(response.status).toBe(503);
    expect(response.headers.get('access-control-allow-origin')).toBe(origin);
    expect(send).not.toHaveBeenCalled();
  });
  it('fails closed on rate limits and limiter outages', async () => {
    allow.mockResolvedValue(false);
    expect((await POST(request())).status).toBe(429);
    allow.mockRejectedValue(new Error('Redis unavailable'));
    expect((await POST(request())).status).toBe(503);
    expect(send).not.toHaveBeenCalled();
  });
  it('does not leak provider exception details', async () => {
    send.mockRejectedValue(new Error('private provider detail'));
    const response = await POST(request());
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain('private provider detail');
  });
});
