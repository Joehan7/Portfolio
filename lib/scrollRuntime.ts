import { copy } from '@/content/copy';
import { distance } from '@/lib/motion';

type Effect = {
  element: HTMLElement;
  top: number;
  height: number;
  kind: 'media' | 'hero' | 'timeline';
  outputs: HTMLElement[];
  active: boolean;
};
const clamp = (v: number) => Math.max(0, Math.min(1, v));
/** One read phase after geometry changes; scroll frames only write compositor transforms. */
export function startScrollRuntime(reduced: boolean) {
  const root = document.documentElement;
  const header = document.querySelector<HTMLElement>('.header');
  const bar = document.querySelector<HTMLElement>('.header-progress');
  const hud = document.querySelector<HTMLElement>('.scroll-hud');
  const number = hud?.querySelector<HTMLElement>('[data-progress]');
  const label = hud?.querySelector<HTMLElement>('[data-current-section]');
  const fine = matchMedia('(pointer: fine)').matches;
  let sections: { top: number; name: string }[] = [];
  let effects: Effect[] = [];
  let height = innerHeight,
    maxScroll = 1,
    footerTop = Infinity;
  let frame = 0,
    dirty = true,
    disposed = false,
    lastPercent = -1,
    lastSection = '',
    wasScrolled = false,
    wasHidden = false;
  const measure = () => {
    const y = scrollY;
    height = innerHeight;
    maxScroll = Math.max(1, root.scrollHeight - height);
    const footer = document.getElementById('footer');
    footerTop = footer ? footer.getBoundingClientRect().top + y : Infinity;
    sections = Array.from(document.querySelectorAll<HTMLElement>('[data-section]')).map((el) => {
      const anchor = el.parentElement?.classList.contains('pin-spacer') ? el.parentElement : el;
      return { top: anchor.getBoundingClientRect().top + y, name: el.dataset.section || copy.home };
    });
    const activeElements = new Set(effects.filter((e) => e.active).map((e) => e.element));
    effects = reduced
      ? []
      : Array.from(document.querySelectorAll<HTMLElement>('.project-media, .hero, .timeline')).map(
          (el) => {
            const r = el.getBoundingClientRect();
            const kind = el.classList.contains('project-media')
              ? 'media'
              : el.classList.contains('hero')
                ? 'hero'
                : 'timeline';
            const selector =
              kind === 'media'
                ? '.media-parallax'
                : kind === 'hero'
                  ? '.hero-content, .hero-stage'
                  : '.timeline-progress';
            return {
              element: el,
              top: r.top + y,
              height: r.height,
              kind,
              outputs: Array.from(el.querySelectorAll<HTMLElement>(selector)),
              active: activeElements.has(el),
            };
          },
        );
    dirty = false;
  };
  const draw = () => {
    frame = 0;
    if (disposed || document.hidden) return;
    if (dirty) measure();
    const y = scrollY;
    const progress = clamp(y / maxScroll);
    const percent = Math.round(progress * 100);
    if (number && percent !== lastPercent) {
      number.textContent = String(percent).padStart(3, '0') + '%';
      lastPercent = percent;
    }
    if (bar) bar.style.transform = 'scaleX(' + progress.toFixed(4) + ')';
    let current = copy.home;
    for (const section of sections) if (section.top < y + height * 0.55) current = section.name;
    if (label && current !== lastSection) {
      label.textContent = current;
      lastSection = current;
    }
    const hidden = footerTop < y + height;
    if (hidden !== wasHidden) {
      hud?.classList.toggle('hud-hidden', hidden);
      wasHidden = hidden;
    }
    const scrolled = y > 80;
    if (scrolled !== wasScrolled) {
      header?.classList.toggle('scrolled', scrolled);
      wasScrolled = scrolled;
    }
    for (const effect of effects) {
      const top = effect.top - y;
      const visible = top < height + 40 && top + effect.height > -40;
      const active = visible && (effect.kind === 'timeline' || fine);
      if (active !== effect.active) {
        effect.outputs.forEach((el) => {
          el.style.willChange = active ? 'transform' : '';
        });
        effect.active = active;
      }
      if (!active) continue;
      if (effect.kind === 'media') {
        const amount = Math.max(-1, Math.min(1, (height / 2 - top - effect.height / 2) / height));
        effect.outputs[0].style.transform =
          'translate3d(0,' + (amount * effect.height * distance.imageParallax).toFixed(2) + 'px,0)';
      } else if (effect.kind === 'hero') {
        const amount = clamp(-top / effect.height);
        effect.outputs.forEach((el) => {
          el.style.transform =
            'translate3d(0,' +
            (amount * (el.classList.contains('hero-content') ? 26 : -34)).toFixed(2) +
            'px,0)';
        });
      } else {
        effect.outputs[0].style.transform =
          'scaleY(' + clamp((height * 0.62 - top) / effect.height).toFixed(4) + ')';
      }
    }
  };
  const schedule = () => {
    if (!frame && !document.hidden && !disposed) frame = requestAnimationFrame(draw);
  };
  const resize = () => {
    dirty = true;
    schedule();
  };
  const visibility = () => {
    root.dataset.visibility = document.hidden ? 'hidden' : 'visible';
    cancelAnimationFrame(frame);
    frame = 0;
    if (!document.hidden) resize();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(document.body);
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', resize);
  addEventListener('signal:geometry', resize);
  document.addEventListener('visibilitychange', visibility);
  document.fonts.ready.then(() => {
    if (!disposed) resize();
  });
  root.dataset.visibility = 'visible';
  schedule();
  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    removeEventListener('scroll', schedule);
    removeEventListener('resize', resize);
    removeEventListener('signal:geometry', resize);
    document.removeEventListener('visibilitychange', visibility);
    effects.forEach((effect) =>
      effect.outputs.forEach((el) => {
        el.style.removeProperty('transform');
        el.style.removeProperty('will-change');
      }),
    );
    header?.classList.remove('scrolled');
    hud?.classList.remove('hud-hidden');
    if (bar) bar.style.transform = 'scaleX(0)';
  };
}
