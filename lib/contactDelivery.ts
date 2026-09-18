import type { ContactInput } from '@/lib/contact';

export const contactTimeoutMs = 15000;
export type ContactDeliveryResult = 'accepted' | 'discarded' | 'limited' | 'unavailable' | 'error';

// Formspree form IDs are public. No server credentials or backend are used.
export async function sendContact(
  input: ContactInput,
  enabled: boolean,
  pageUrl: string,
): Promise<ContactDeliveryResult> {
  const { contactSchema } = await import('@/lib/contact');
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) return 'error';
  if (parsed.data.website) return 'discarded';
  if (!enabled) return 'unavailable';
  const { name, email, message, website } = parsed.data;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), contactTimeoutMs);
  try {
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
      url.origin !== 'https://formspree.io' ||
      !/^\/f\/[a-zA-Z0-9]+$/.test(url.pathname) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    )
      return 'unavailable';
    const response = await fetch(url.href, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      credentials: 'omit',
      redirect: 'error',
      signal: controller.signal,
      body: JSON.stringify({ name, email, message, _gotcha: website || '' }),
    });
    if (response.status === 429) return 'limited';
    if (response.status === 503) return 'unavailable';
    if (!response.ok) return 'error';
    const result: unknown = await response.json();
    if (!result || typeof result !== 'object') return 'error';
    const body = result as { ok?: unknown; next?: unknown; errors?: unknown; error?: unknown };
    // Formspree's official core SDK recognizes a string `next` as its success response.
    const accepted = 'ok' in body ? body.ok === true : typeof body.next === 'string';
    return accepted && !('errors' in body) && !('error' in body) ? 'accepted' : 'error';
  } catch {
    // Network failures, timeout, redirects, and malformed responses never imply delivery.
    return 'error';
  } finally {
    clearTimeout(timeout);
  }
}
