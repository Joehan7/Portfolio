import type { ContactInput } from '@/lib/contact';
import { copy } from '@/content/copy';

export const contactTimeoutMs = 15000;
export type ContactDeliveryResult = 'accepted' | 'discarded' | 'limited' | 'unavailable' | 'error';

// Pages loads only a public API URL; Resend and rate-limit credentials stay on the server.
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
    let endpoint = '/api/contact';
    if (!serverEnabled) {
      const configUrl = new URL(
        `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/contact-delivery.json`,
        pageUrl,
      );
      const configResponse = await fetch(configUrl.href, {
        credentials: 'omit',
        redirect: 'error',
        cache: 'no-store',
        signal: controller.signal,
      });
      if (!configResponse.ok) return 'unavailable';
      const config: unknown = await configResponse.json();
      if (
        !config ||
        typeof config !== 'object' ||
        !('endpoint' in config) ||
        typeof config.endpoint !== 'string' ||
        !config.endpoint
      )
        return 'unavailable';
      let url: URL;
      try {
        url = new URL(config.endpoint);
      } catch {
        return 'unavailable';
      }
      if (
        url.protocol !== 'https:' ||
        url.pathname !== '/api/contact' ||
        url.username ||
        url.password ||
        url.search ||
        url.hash
      )
        return 'unavailable';
      endpoint = url.href;
    }
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      credentials: 'omit',
      redirect: 'error',
      signal: controller.signal,
      body: JSON.stringify({ name, email, message, website }),
    });
    if (response.status === 429) return 'limited';
    if (response.status === 503) return 'unavailable';
    if (!response.ok) return 'error';
    const result: unknown = await response.json();
    if (!result || typeof result !== 'object') return 'error';
    const body = result as { message?: unknown };
    return body.message === copy.contact.success ? 'accepted' : 'error';
  } catch {
    // Network failures, timeout, redirects, and malformed responses never imply delivery.
    return 'error';
  } finally {
    clearTimeout(timeout);
  }
}
