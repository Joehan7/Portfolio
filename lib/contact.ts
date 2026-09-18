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
// Preserve existing page wiring; the transport checks the public Formspree config.
export const contactReady = () => true;
