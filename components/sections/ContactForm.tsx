'use client';
import { useForm, type Resolver, type FieldErrors } from 'react-hook-form';
import { useRef, useState } from 'react';
import { ArrowUpRight, Check } from 'lucide-react';
import type { ContactInput } from '@/lib/contact';
import { copy } from '@/content/copy';
import { profile } from '@/content/profile';
import { sendContact } from '@/lib/contactDelivery';
const resolveContact: Resolver<ContactInput> = async (values) => {
  const { contactSchema } = await import('@/lib/contact');
  const parsed = contactSchema.safeParse(values);
  if (parsed.success) return { values: parsed.data, errors: {} };
  const errors: FieldErrors<ContactInput> = {};
  for (const issue of parsed.error.issues) {
    const field = issue.path[0] as keyof ContactInput;
    if (!errors[field]) errors[field] = { type: issue.code, message: issue.message };
  }
  return { values: {}, errors };
};
export function ContactForm({ enabled }: { enabled: boolean }) {
  const inFlight = useRef(false);
  const [status, setStatus] = useState(''),
    [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: resolveContact,
    defaultValues: { website: '' },
  });
  const submit = async (data: ContactInput) => {
    if (inFlight.current || sent) return;
    inFlight.current = true;
    setStatus(copy.contact.sending);
    try {
      const result = await sendContact(data, enabled, window.location.href);
      if (result === 'accepted') {
        setSent(true);
        setStatus(copy.contact.success);
        reset();
      } else {
        setStatus(
          result === 'discarded'
            ? ''
            : result === 'limited'
              ? copy.contact.limited
              : result === 'activation' || result === 'unavailable'
                ? copy.contact.unavailable
                : copy.contact.error,
        );
      }
    } catch {
      setStatus(copy.contact.error);
    } finally {
      inFlight.current = false;
    }
  };
  return (
    <form
      className="contact-form"
      action={`https://formsubmit.co/${profile.email}`}
      method="POST"
      onSubmit={(event) => void handleSubmit(submit)(event)}
      aria-busy={isSubmitting}
      noValidate
    >
      <div className="form-pair">
        <div className="form-field">
          <label htmlFor="contact-name">{copy.contact.name}</label>
          <input
            id="contact-name"
            required
            minLength={2}
            maxLength={100}
            autoComplete="name"
            placeholder={copy.contact.namePlaceholder}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
            {...register('name')}
          />
          {errors.name && (
            <span id="name-error" className="field-error">
              {errors.name.message}
            </span>
          )}
        </div>
        <div className="form-field">
          <label htmlFor="contact-email">{copy.contact.emailField}</label>
          <input
            id="contact-email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            placeholder={copy.contact.emailPlaceholder}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email')}
          />
          {errors.email && (
            <span id="email-error" className="field-error">
              {errors.email.message}
            </span>
          )}
        </div>
      </div>
      <div className="form-field">
        <label htmlFor="contact-message">{copy.contact.message}</label>
        <textarea
          id="contact-message"
          rows={4}
          required
          minLength={10}
          maxLength={5000}
          placeholder={copy.contact.messagePlaceholder}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'message-error' : undefined}
          {...register('message')}
        />
        {errors.message && (
          <span id="message-error" className="field-error">
            {errors.message.message}
          </span>
        )}
      </div>
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="website">{copy.contact.website}</label>
        <input
          id="website"
          tabIndex={-1}
          autoComplete="off"
          maxLength={200}
          {...register('website')}
        />
      </div>
      <div className="form-actions">
        <button type="submit" className="button primary" disabled={isSubmitting || sent}>
          {sent ? <Check size={17} /> : <ArrowUpRight size={17} />}{' '}
          {isSubmitting ? copy.contact.sending : copy.contact.send}
        </button>
        <p>
          {copy.contact.notice} <a href={`mailto:${profile.email}`}>{copy.contact.emailLink}</a>
        </p>
      </div>
      <div className="form-status mono" role="status" aria-live="polite">
        {status}
      </div>
    </form>
  );
}
