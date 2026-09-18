'use client';
import * as m from 'motion/react-m';
import { useRef } from 'react';
import { useMotionValue, useSpring } from 'motion/react';
import { useSite } from '@/components/chrome/Providers';
import { spring, distance } from '@/lib/motion';
export function Magnetic({ children }: { children: React.ReactNode }) {
  const { reduced } = useSite();
  const bounds = useRef<{ rect: DOMRect; scroll: number } | null>(null);
  const x = useMotionValue(0),
    y = useMotionValue(0),
    sx = useSpring(x, spring.stiff),
    sy = useSpring(y, spring.stiff);
  const reset = () => {
    bounds.current = null;
    x.set(0);
    y.set(0);
  };
  return (
    <m.span
      className="magnetic"
      style={{ x: reduced ? 0 : sx, y: reduced ? 0 : sy }}
      onPointerEnter={(e) => {
        bounds.current = { rect: e.currentTarget.getBoundingClientRect(), scroll: scrollY };
      }}
      onPointerMove={(e) => {
        if (reduced || e.pointerType !== 'mouse') return;
        const cached = bounds.current;
        if (!cached) return;
        const r = cached.rect;
        const dx = e.clientX - r.left - r.width / 2,
          dy = e.clientY - r.top + scrollY - cached.scroll - r.height / 2;
        const strength = Math.max(0, 1 - Math.hypot(dx, dy) / (distance.magneticRadius * 2));
        x.set(dx * distance.magneticStrength * strength);
        y.set(dy * distance.magneticStrength * strength);
      }}
      onPointerLeave={reset}
      onBlur={reset}
    >
      {children}
    </m.span>
  );
}
