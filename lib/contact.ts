import * as z from 'zod/mini';
import { copy } from '@/content/copy';
export const contactSchema = z.object({
  name: z
    .string()
    .check(
      z.trim(),
      z.minLength(2, copy.contact.shortName),
      z.maxLength(100, copy.contact.longName),
    ),
  email: z.email(copy.contact.invalidEmail).check(z.maxLength(254, copy.contact.longEmail)),
  message: z
    .string()
    .check(
      z.trim(),
      z.minLength(10, copy.contact.shortMessage),
      z.maxLength(5000, copy.contact.longMessage),
    ),
  website: z.optional(z.string().check(z.maxLength(200))),
});
export type ContactInput = z.infer<typeof contactSchema>;
export const contactReady = () =>
  Boolean(
    process.env.RESEND_API_KEY &&
    process.env.CONTACT_FROM &&
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN,
  );
