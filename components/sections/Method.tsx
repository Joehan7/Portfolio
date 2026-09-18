'use client';
import * as m from 'motion/react-m';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { method } from '@/content/method';
import { copy } from '@/content/copy';
import { useSite } from '@/components/chrome/Providers';
import { RouteLink } from '@/components/ui/RouteLink';
import { spring, physics, dur } from '@/lib/motion';
import { scrollToTarget } from '@/lib/scroll';
export function Method() {
  const root = useRef<HTMLElement>(null),
    jump = useRef<(index: number) => void>(() => {});
  const [active, setActive] = useState(0),
    [pinned, setPinned] = useState(false),
    [desktop, setDesktop] = useState(false);
  const { reduced } = useSite();
  useEffect(() => {
    const media = matchMedia('(min-width: 900px)');
    const update = () => setDesktop(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    const el = root.current;
    if (!el || reduced || !desktop) return;
    let disposed = false;
    let cleanup = () => {};
    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        if (disposed) return;
        gsap.registerPlugin(ScrollTrigger);
        const context = gsap.context(() => {
          el.classList.add('is-pinned');
          setPinned(true);
          const state = { progress: 0 };
          const meter = el.querySelector<HTMLElement>('.method-meter > span');
          let lastPhase = -1;
          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: el,
              start: 'top top',
              end: () => '+=' + innerHeight * 5,
              pin: true,
              scrub: physics.scrub,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onRefresh: () => dispatchEvent(new Event('signal:geometry')),
            },
          });
          timeline.to(state, {
            progress: 1,
            duration: 1,
            ease: 'none',
            onUpdate: () => {
              const phase = Math.min(method.length - 1, Math.floor(state.progress * method.length));
              if (phase !== lastPhase) {
                setActive(phase);
                lastPhase = phase;
              }
              if (meter) meter.style.transform = 'scaleX(' + state.progress.toFixed(4) + ')';
            },
          });
          const trigger = timeline.scrollTrigger!;
          jump.current = (index) =>
            scrollToTarget(
              trigger.start + ((trigger.end - trigger.start) * (index + 0.35)) / method.length,
            );
          document.documentElement.dataset.methodTriggers = '1';
          let resizeTimer: ReturnType<typeof setTimeout>;
          const resize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => ScrollTrigger.refresh(), dur.resize * 1000);
          };
          addEventListener('resize', resize);
          return () => {
            timeline.kill();
            trigger.kill();
            el.classList.remove('is-pinned');
            meter?.style.removeProperty('transform');
            setPinned(false);
            clearTimeout(resizeTimer);
            removeEventListener('resize', resize);
            document.documentElement.dataset.methodTriggers = '0';
          };
        }, el);
        cleanup = () => context.revert();
      },
    );
    return () => {
      disposed = true;
      cleanup();
      setPinned(false);
    };
  }, [reduced, desktop]);
  useEffect(() => {
    if (pinned || reduced) return;
    const phases = root.current?.querySelectorAll('.method-phase');
    if (!phases) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number((entry.target as HTMLElement).dataset.phase);
            setActive(index);
          }
        });
      },
      { rootMargin: '-20% 0px -50% 0px' },
    );
    phases.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pinned, reduced]);
  return (
    <section
      ref={root}
      id="method"
      className={`method-section ${pinned ? 'is-pinned' : ''}`}
      data-section="method"
    >
      <div className="shell method-inner">
        <div className="method-heading">
          <div className="section-label mono">{copy.method.label}</div>
          <h2>{copy.method.title}</h2>
          <p>{copy.method.intro}</p>
        </div>
        <div className="method-grid">
          <div className="method-rail" aria-label={copy.method.progress}>
            {method.map((phase, i) => (
              <a
                href={`#phase-${phase.key}`}
                key={phase.key}
                aria-current={active === i ? 'step' : undefined}
                onClick={(event) => {
                  if (pinned) {
                    event.preventDefault();
                    event.stopPropagation();
                    jump.current(i);
                  }
                }}
              >
                <span className="mono">{String(phase.index).padStart(2, '0')}</span>
                {phase.key}
                {active === i && <m.i layoutId="method-indicator" transition={spring.soft} />}
              </a>
            ))}
            <div className="method-meter" aria-hidden="true">
              <span />
            </div>
          </div>
          <div className="method-phases">
            {method.map((phase, i) => (
              <article
                id={`phase-${phase.key}`}
                data-phase={i}
                key={phase.key}
                className={`method-phase ${active === i ? 'active' : ''}`}
                aria-hidden={pinned && active !== i ? true : undefined}
              >
                <span className="phase-index mono" aria-hidden="true">
                  {String(phase.index).padStart(2, '0')}
                </span>
                <div>
                  <h3>{phase.title}</h3>
                  <p>{phase.line}</p>
                  <ul>
                    {phase.bullets.map((bullet, j) => (
                      <li key={bullet} style={{ '--step': j } as React.CSSProperties}>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                  <RouteLink
                    tabIndex={pinned && active !== i ? -1 : undefined}
                    href={`/work/${phase.projectSlug}`}
                    className="text-link"
                  >
                    {copy.method.link}
                    <ArrowUpRight size={16} />
                  </RouteLink>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
