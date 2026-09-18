import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { contactSchema, contactReady } from '@/lib/contact';
import { allowContact } from '@/lib/rateLimit';
import { profile } from '@/content/profile';
import { copy } from '@/content/copy';
export const runtime = 'nodejs';
const reply = (message: string, status: number) =>
  NextResponse.json({ message }, { status, headers: { 'Cache-Control': 'no-store' } });
export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  try {
    const expectedHost = request.headers.get('host') || new URL(request.url).host;
    if (!origin || new URL(origin).host !== expectedHost) return reply(copy.contact.error, 403);
  } catch {
    return reply(copy.contact.error, 403);
  }
  if (!request.headers.get('content-type')?.includes('application/json'))
    return reply(copy.contact.invalid, 415);
  try {
    const reader = request.body?.getReader();
    if (!reader) return reply(copy.contact.invalid, 400);
    let length = 0;
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 16384) {
        await reader.cancel();
        return reply(copy.contact.longMessage, 413);
      }
      chunks.push(value);
    }
    const body = new Uint8Array(length);
    let offset = 0;
    for (const c of chunks) {
      body.set(c, offset);
      offset += c.length;
    }
    let data: unknown;
    try {
      data = JSON.parse(new TextDecoder().decode(body));
    } catch {
      return reply(copy.contact.invalid, 400);
    }
    const result = contactSchema.safeParse(data);
    if (!result.success) return reply(copy.contact.invalid, 400);
    if (result.data.website) return reply(copy.contact.success, 200);
    if (!contactReady()) return reply(copy.contact.unavailable, 503);
    // Vercel overwrites this header. Other deployments use a shared, conservative bucket.
    const ip = process.env.VERCEL
      ? request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
      : 'shared';
    if (!(await allowContact(ip))) return reply(copy.contact.limited, 429);
    const { name, email, message } = result.data;
    const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: process.env.CONTACT_FROM!,
      to: profile.email,
      replyTo: email,
      subject: copy.contact.title,
      text: [name, email, '', message].join('\n'),
    });
    return error ? reply(copy.contact.error, 502) : reply(copy.contact.success, 200);
  } catch {
    return reply(copy.contact.error, 503);
  }
}
