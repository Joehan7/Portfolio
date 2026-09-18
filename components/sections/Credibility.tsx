import { credibility } from '@/content/skills';
import { copy } from '@/content/copy';
import { Marquee } from '@/components/motion/Marquee';
export function Credibility() {
  return (
    <section className="credibility" aria-label={copy.credibility.title}>
      {credibility.map((items, i) => (
        <Marquee key={i} items={items} reverse={i === 1} />
      ))}
    </section>
  );
}
