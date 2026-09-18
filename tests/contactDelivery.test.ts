import { afterEach, describe, expect, it, vi } from 'vitest';
import { sendContact, contactTimeoutMs } from '@/lib/contactDelivery';
const input = {
  name: '  Test Person  ',
  email: 'visitor@example.com',
  message: '  A message for the portfolio owner.  ',
  website: '',
};
const source = 'https://joehan7.github.io/Portfolio/contact/?private=value#fragment';
const endpoint = 'https://formspree.io/f/testform';
const mockResponse = (body: unknown, status = 200) => {
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(Response.json({ endpoint }))
    .mockResolvedValue(Response.json(body, { status }));
  vi.stubGlobal('fetch', fetch);
  return fetch;
};
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.useRealTimers();
});
describe('Formspree contact delivery transport', () => {
  it('loads the Pages runtime URL and sends only validated fields, without credentials', async () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '/Portfolio');
    const fetch = mockResponse({ next: 'https://formspree.io/thanks' });
    expect(await sendContact(input, true, source)).toBe('accepted');
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls[0][0]).toBe(
      'https://joehan7.github.io/Portfolio/contact-delivery.json',
    );
    const [url, options] = fetch.mock.calls[1];
    expect(url).toBe(endpoint);
    expect(options.credentials).toBe('omit');
    expect(options.redirect).toBe('error');
    expect(JSON.parse(options.body)).toEqual({
      name: 'Test Person',
      email: input.email,
      message: 'A message for the portfolio owner.',
      _gotcha: '',
    });
  });
  it('does not send invalid values or honeypots', async () => {
    const fetch = mockResponse({ next: 'https://formspree.io/thanks' });
    expect(await sendContact({ ...input, email: 'bad' }, true, source)).toBe('error');
    expect(await sendContact({ ...input, message: 'x'.repeat(5001) }, true, source)).toBe('error');
    expect(await sendContact({ ...input, website: 'spam' }, true, source)).toBe('discarded');
    expect(fetch).not.toHaveBeenCalled();
  });
  it.each([
    '',
    'http://formspree.io/f/testform',
    'https://user:password@formspree.io/f/testform',
    'https://formspree.io/f/testform?secret=value',
    'https://formspree.io/f/testform#fragment',
    '/api/contact',
    'https://formspree.io.evil.example/f/testform',
    'https://formspree.io/forms/testform',
    'https://formspree.io/f/testform/',
    'https://other.example.com/api/contact',
  ])('fails closed for invalid or missing endpoint %s', async (endpoint) => {
    const fetch = vi.fn().mockResolvedValue(Response.json({ endpoint }));
    vi.stubGlobal('fetch', fetch);
    expect(await sendContact(input, true, source)).toBe('unavailable');
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it.each([null, {}, { endpoint: 42 }])('rejects malformed configuration %s', async (config) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(config)));
    expect(await sendContact(input, true, source)).toBe('unavailable');
  });
  it('handles a missing config file', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 404 })));
    expect(await sendContact(input, true, source)).toBe('unavailable');
  });
  it.each([{}, { success: true }, { message: 'Rejected.' }, null])(
    'never claims delivery without the API acknowledgement %s',
    async (body) => {
      mockResponse(body);
      expect(await sendContact(input, true, source)).toBe('error');
    },
  );
  it.each([
    [429, 'limited'],
    [503, 'unavailable'],
    [502, 'error'],
    [403, 'error'],
  ])('handles HTTP %s honestly', async (status, expected) => {
    mockResponse({ next: 'https://formspree.io/thanks' }, status as number);
    expect(await sendContact(input, true, source)).toBe(expected);
  });
  it('handles malformed responses and network failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(Response.json({ endpoint }))
        .mockResolvedValue(new Response('<html>Error</html>')),
    );
    expect(await sendContact(input, true, source)).toBe('error');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));
    expect(await sendContact(input, true, source)).toBe('error');
  });
  it('aborts a stalled submission and clears its timer', async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(
        (_url, options) =>
          new Promise((_resolve, reject) => {
            options.signal.addEventListener('abort', () => reject(new Error('aborted')), {
              once: true,
            });
          }),
      ),
    );
    const result = sendContact(input, true, source);
    await vi.advanceTimersByTimeAsync(contactTimeoutMs);
    expect(await result).toBe('error');
    expect(vi.getTimerCount()).toBe(0);
  });
  it('accepts the Formspree boolean acknowledgement', async () => {
    mockResponse({ ok: true });
    expect(await sendContact(input, true, source)).toBe('accepted');
  });
  it.each([
    { ok: false, next: 'https://formspree.io/thanks' },
    { ok: 'true' },
    { ok: 'false', next: '/thanks' },
    { next: 42 },
    { ok: true, errors: [] },
    { next: 'https://formspree.io/thanks', error: 'Rejected' },
  ])('rejects contradictory or invalid acceptance %s', async (body) => {
    mockResponse(body);
    expect(await sendContact(input, true, source)).toBe('error');
  });
  it('never selects a server API even when old hosting credentials exist', async () => {
    vi.stubEnv('RESEND_API_KEY', 'obsolete-key-must-not-be-used');
    const fetch = mockResponse({ next: 'https://formspree.io/thanks' });
    expect(await sendContact(input, true, source)).toBe('accepted');
    expect(fetch.mock.calls[1][0]).toBe(endpoint);
  });
});
