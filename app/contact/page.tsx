import { copy } from '@/content/copy';
import { profile } from '@/content/profile';
import { pageMetadata } from '@/content/seo';
import { ContactForm } from '@/components/sections/ContactForm';
import { contactReady } from '@/lib/contact';
export const metadata = pageMetadata(copy.contact.title, '/contact');
export default function ContactPage() {
  return (
    <main id="main" data-section="contact" className="shell page-top contact-page">
      <div className="section-label mono">{copy.header.cta}</div>
      <h1>{copy.contact.title}</h1>
      <p>{copy.contact.intro}</p>
      <div className="contact-layout">
        <aside>
          <a href={'mailto:' + profile.email}>{profile.email}</a>
          <p className="mono muted">{profile.location}</p>
        </aside>
        <ContactForm enabled={contactReady()} />
      </div>
    </main>
  );
}
