'use client';
import * as m from 'motion/react-m';
import { useEffect, useState } from 'react';
import { useMotionValue, useSpring } from 'motion/react';
import { spring } from '@/lib/motion';
import { copy } from '@/content/copy';
export default function Cursor() {
  const [active, setActive] = useState(false),
    [label, setLabel] = useState(''),
    [interactive, setInteractive] = useState(false);
  const x = useMotionValue(-100),
    y = useMotionValue(-100),
    sx = useSpring(x, spring.soft),
    sy = useSpring(y, spring.soft);
  useEffect(() => {
    if (!matchMedia('(pointer: fine)').matches) return;
    const move = (e: PointerEvent) => {
      setActive(true);
      x.set(e.clientX);
      y.set(e.clientY);
      const el = e.target as HTMLElement;
      const kind = el.closest<HTMLElement>('[data-cursor]')?.dataset.cursor;
      setLabel(kind === 'view' ? copy.cursor.view : kind === 'copy' ? copy.cursor.copy : '');
      setInteractive(!!el.closest('a,button,input,textarea'));
    };
    const leave = () => setActive(false);
    addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', leave);
    return () => {
      removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
    };
  }, [x, y]);
  return (
    <div aria-hidden="true" className={active ? 'cursor-visible' : 'cursor-hidden'}>
      <m.div className="cursor-dot" style={{ x, y }} />
      <m.div
        className={`cursor-ring ${interactive ? 'interactive' : ''} ${label ? 'labelled' : ''}`}
        style={{ x: sx, y: sy }}
      >
        {label}
      </m.div>
    </div>
  );
}
