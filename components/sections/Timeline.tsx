import { experience } from '@/content/experience';
import { education } from '@/content/education';
import { copy } from '@/content/copy';
import { Reveal } from '@/components/motion/Reveal';
import { RouteLink } from '@/components/ui/RouteLink';
import { ArrowUpRight } from 'lucide-react';
export function Timeline() {
  return (
    <section id="experience" className="section shell timeline-section" data-section="experience">
      <div className="section-label mono">{copy.timeline.label}</div>
      <div className="section-head">
        <Reveal kind="heading">
          <h2>{copy.timeline.title}</h2>
        </Reveal>
        <RouteLink href="/resume" className="text-link">
          {copy.timeline.full}
          <ArrowUpRight size={16} />
        </RouteLink>
      </div>
      <div className="timeline">
        <span className="timeline-progress" aria-hidden="true" />
        {experience.map((item, i) => (
          <Reveal key={item.org} kind="media">
            <article className={`timeline-entry ${i === 0 ? 'recent' : ''}`}>
              <div className="timeline-date mono">
                {item.start ? (
                  <>
                    {item.start}
                    <span>— {item.end}</span>
                  </>
                ) : (
                  copy.timeline.undated
                )}
              </div>
              <div className="timeline-copy">
                <h3>{item.role}</h3>
                <p className="org">{item.org}</p>
                <p className="timeline-outcome">{item.outcomes[0]}</p>
                {i === 0 && <p className="timeline-outcome">{item.outcomes[2]}</p>}
              </div>
            </article>
          </Reveal>
        ))}
        <Reveal kind="media">
          <article className="timeline-entry">
            <div className="timeline-date mono">{copy.timeline.education}</div>
            <div className="timeline-copy">
              <h3>{education[0].credential}</h3>
              <p className="org">{education[0].institution}</p>
              <p className="timeline-outcome mono">{education[0].detail}</p>
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
