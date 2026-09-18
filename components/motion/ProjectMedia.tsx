'use client';
import * as m from 'motion/react-m';
import { useRef, type ReactNode } from 'react';
import { useMotionValue, useSpring } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { useSite } from '@/components/chrome/Providers';
import { RouteLink } from '@/components/ui/RouteLink';
import { spring, distance } from '@/lib/motion';
import { copy } from '@/content/copy';
export function ProjectMedia({
  href,
  children,
  index,
}: {
  href: string;
  children: ReactNode;
  index: number;
}) {
  const { reduced } = useSite();
  const bounds = useRef<{ rect: DOMRect; scroll: number } | null>(null);
  const x = useMotionValue(0),
    y = useMotionValue(0),
    rx = useMotionValue(0),
    ry = useMotionValue(0);
  const sx = useSpring(x, spring.media),
    sy = useSpring(y, spring.media),
    srx = useSpring(rx, spring.media),
    sry = useSpring(ry, spring.media);
  const reset = () => {
    bounds.current = null;
    x.set(0);
    y.set(0);
    rx.set(0);
    ry.set(0);
  };
  return (
    <RouteLink
      href={href}
      className="project-media"
      data-cursor="view"
      tabIndex={-1}
      onPointerEnter={(e) => {
        bounds.current = { rect: e.currentTarget.getBoundingClientRect(), scroll: scrollY };
      }}
      onPointerMove={(e) => {
        if (reduced || e.pointerType !== 'mouse') return;
        const cached = bounds.current;
        if (!cached) return;
        const r = cached.rect;
        const px = (e.clientX - r.left) / r.width - 0.5,
          py = (e.clientY - r.top + scrollY - cached.scroll) / r.height - 0.5;
        x.set(px * distance.small);
        y.set(py * distance.small);
        rx.set(-py * distance.tilt);
        ry.set(px * distance.tilt);
      }}
      onPointerLeave={reset}
      onBlur={reset}
    >
      <div className="media-parallax">
        <m.div
          className="media-inner"
          style={reduced ? undefined : { x: sx, y: sy, rotateX: srx, rotateY: sry }}
        >
          {children}
        </m.div>
      </div>
      <span className="media-reticle top-left" aria-hidden="true" />
      <span className="media-reticle bottom-right" aria-hidden="true" />
      <span className="media-scan" aria-hidden="true" />
      <span className="media-open" aria-hidden="true">
        <ArrowUpRight size={20} />
      </span>
      <div className="media-caption mono">
        <span>{copy.work.concept}</span>
        <span>{String(index).padStart(2, '0')} / 04</span>
      </div>
    </RouteLink>
  );
}
