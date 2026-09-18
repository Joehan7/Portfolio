import { afterEach, describe, expect, it, vi } from 'vitest';
import { sendContact, hostedContactEndpoint, contactTimeoutMs } from '@/lib/contactDelivery';
import { copy } from '@/content/copy';

const input = {
  name: '  Test Person  ',
  email: 'visitor@example.com',
  message: '  A message for the portfolio owner.  ',
  website: '',
};
const source = 'https://joehan7.github.io/Portfolio/contact/?private=value#fragment';
const mockResponse = (body: unknown, status = 200) => {
  const fetch = vi.fn().mockResolvedValue(Response.json(body, { status }));
  vi.stubGlobal('fetch', fetch);
  return fetch;
};
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('contact delivery transport', () => {
  it('sends only validated fields to the fixed recipient with reply-to and honeypot mapping', async () => {
    const fetch = mockResponse({ success: 'true' });
    expect(await sendContact(input, false, source)).toBe('accepted');
    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe('https://formsubmit.co/ajax/joehanantony@gmail.com');
    expect(url).toBe(hostedContactEndpoint);
    expect(options.credentials).toBe('omit');
    expect(options.redirect).toBe('error');
    expect(JSON.parse(options.body)).toEqual({
      name: 'Test Person',
      email: input.email,
      message: 'A message for the portfolio owner.',
      _honey: '',
      _replyto: input.email,
      _subject: 'Signal portfolio — new contact message',
      _url: 'https://joehan7.github.io/Portfolio/contact/',
    });
  });
  it('does not send invalid values or honeypot submissions', async () => {
    const fetch = mockResponse({ success: true });
    expect(await sendContact({ ...input, email: 'bad' }, false, source)).toBe('error');
    expect(await sendContact({ ...input, message: 'x'.repeat(5001) }, false, source)).toBe('error');
    expect(await sendContact({ ...input, website: 'spam' }, false, source)).toBe('discarded');
    expect(fetch).not.toHaveBeenCalled();
  });
  it('never confuses the real HTTP-200 activation response with delivery', async () => {
    mockResponse({ success: 'false', message: 'This form needs Activation.' });
    expect(await sendContact(input, false, source)).toBe('activation');
  });
  it.each([false, 'false', 'yes', 1, null, undefined])(
    'rejects an unacknowledged success value %s',
    async (success) => {
      mockResponse({ success });
      expect(await sendContact(input, false, source)).toBe('error');
    },
  );
  it('accepts the boolean acknowledgement as well as the string response', async () => {
    mockResponse({ success: true });
    expect(await sendContact(input, false, source)).toBe('accepted');
  });
  it.each([
    [429, 'limited'],
    [503, 'unavailable'],
    [500, 'error'],
    [403, 'error'],
  ])('handles HTTP %s without claiming delivery', async (status, expected) => {
    mockResponse({ success: true }, status as number);
    expect(await sendContact(input, false, source)).toBe(expected);
  });
  it('handles provider limits returned inside a successful HTTP response', async () => {
    mockResponse({ success: false, message: 'Too many requests' });
    expect(await sendContact(input, false, source)).toBe('limited');
  });
  it('handles malformed responses and network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>Error</html>')));
    expect(await sendContact(input, false, source)).toBe('error');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));
    expect(await sendContact(input, false, source)).toBe('error');
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
    const result = sendContact(input, false, source);
    await vi.advanceTimersByTimeAsync(contactTimeoutMs);
    expect(await result).toBe('error');
    expect(vi.getTimerCount()).toBe(0);
  });
  it('preserves the server API transport when its credentials are configured', async () => {
    const fetch = mockResponse({ message: copy.contact.success });
    expect(await sendContact(input, true, source)).toBe('accepted');
    expect(fetch.mock.calls[0][0]).toBe('/api/contact');
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({
      name: 'Test Person',
      email: input.email,
      message: 'A message for the portfolio owner.',
      website: '',
    });
    mockResponse({ success: true, message: 'unrecognised response' });
    expect(await sendContact(input, true, source)).toBe('error');
  });
});
