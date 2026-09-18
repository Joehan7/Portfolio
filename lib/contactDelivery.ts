import type { ContactInput } from '@/lib/contact';
import { profile } from '@/content/profile';
import { copy } from '@/content/copy';

export const hostedContactEndpoint = `https://formsubmit.co/ajax/${profile.email}`;
export const contactTimeoutMs = 15000;
export type ContactDeliveryResult =
  'accepted' | 'discarded' | 'activation' | 'limited' | 'unavailable' | 'error';

// Pages sends directly to the managed form backend. Server credentials stay on the server.
export async function sendContact(
  input: ContactInput,
  serverEnabled: boolean,
  pageUrl: string,
): Promise<ContactDeliveryResult> {
  const { contactSchema } = await import('@/lib/contact');
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) return 'error';
  if (parsed.data.website) return 'discarded';
  const { name, email, message, website } = parsed.data;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), contactTimeoutMs);
  try {
    const source = new URL(pageUrl);
    const response = await fetch(serverEnabled ? '/api/contact' : hostedContactEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      credentials: 'omit',
      redirect: 'error',
      signal: controller.signal,
      body: JSON.stringify(
        serverEnabled
          ? { name, email, message, website }
          : {
              name,
              email,
              message,
              _honey: website || '',
              _replyto: email,
              _subject: 'Signal portfolio — new contact message',
              _url: source.origin + source.pathname,
            },
      ),
    });
    if (response.status === 429) return 'limited';
    if (response.status === 503) return 'unavailable';
    if (!response.ok) return 'error';
    const result: unknown = await response.json();
    if (!result || typeof result !== 'object') return 'error';
    const body = result as { success?: unknown; message?: unknown };
    if (serverEnabled) return body.message === copy.contact.success ? 'accepted' : 'error';
    if (body.success === true || body.success === 'true') return 'accepted';
    if (typeof body.message === 'string') {
      if (/activat|confirm.*email/i.test(body.message)) return 'activation';
      if (/too many|rate limit/i.test(body.message)) return 'limited';
    }
    return 'error';
  } catch {
    // Network failures, timeout, redirects, and malformed responses never imply delivery.
    return 'error';
  } finally {
    clearTimeout(timeout);
  }
}
