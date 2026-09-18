import { Hero } from '@/components/sections/Hero';
import { Credibility } from '@/components/sections/Credibility';
import { SelectedWork } from '@/components/sections/SelectedWork';
import { Method } from '@/components/sections/Method';
import { Capabilities } from '@/components/sections/Capabilities';
import { Timeline } from '@/components/sections/Timeline';
import { SignalSearch } from '@/components/sections/SignalSearch';
import { Marquee } from '@/components/motion/Marquee';
import { ContactForm } from '@/components/sections/ContactForm';
import { copy } from '@/content/copy';
import { contactReady } from '@/lib/contact';
export default function Home() {
  return (
    <main id="main">
      <Hero />
      <Credibility />
      <SelectedWork />
      <Method />
      <section className="manifesto" aria-label={copy.manifesto}>
        <Marquee items={[copy.manifesto]} editorial />
      </section>
      <Capabilities />
      <Timeline />
      <SignalSearch />
      <section className="section shell home-contact" data-section="contact">
        <div className="section-head">
          <h2>{copy.contact.title}</h2>
          <p>{copy.contact.intro}</p>
        </div>
        <ContactForm enabled={contactReady()} />
      </section>
    </main>
  );
}
