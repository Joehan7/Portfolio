import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { contactSchema, contactReady } from '@/lib/contact';
import { allowContact } from '@/lib/rateLimit';
import { profile } from '@/content/profile';
import { copy } from '@/content/copy';
export const runtime = 'nodejs';
function allowedOrigin(request: Request) {
  const origin = request.headers.get('origin');
  try {
    if (
      origin &&
      (origin === new URL(request.url).origin || origin === 'https://joehan7.github.io')
    )
      return origin;
  } catch {
    /* Invalid origins are rejected. */
  }
  return null;
}
const headersFor = (origin: string | null) => ({
  'Cache-Control': 'no-store',
  Vary: 'Origin',
  ...(origin ? { 'Access-Control-Allow-Origin': origin } : {}),
});
export async function OPTIONS(request: Request) {
  const origin = allowedOrigin(request);
  const headers = request.headers.get('access-control-request-headers') || '';
  if (
    !origin ||
    request.headers.get('access-control-request-method') !== 'POST' ||
    headers
      .split(',')
      .some(
        (header) =>
          header.trim() && !['content-type', 'accept'].includes(header.trim().toLowerCase()),
      )
  )
    return NextResponse.json(
      { message: copy.contact.error },
      { status: 403, headers: headersFor(null) },
    );
  return new Response(null, {
    status: 204,
    headers: {
      ...headersFor(origin),
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type, Accept',
      'Access-Control-Max-Age': '600',
    },
  });
}
export async function POST(request: Request) {
  const origin = allowedOrigin(request);
  const reply = (message: string, status: number) =>
    NextResponse.json({ message }, { status, headers: headersFor(origin) });
  if (!origin) return reply(copy.contact.error, 403);
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
    const { data: accepted, error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: process.env.CONTACT_FROM!,
      to: profile.email,
      replyTo: email,
      subject: copy.contact.title,
      text: [name, email, '', message].join('\n'),
    });
    return error || !accepted?.id ? reply(copy.contact.error, 502) : reply(copy.contact.success, 200);
  } catch {
    return reply(copy.contact.error, 503);
  }
}
