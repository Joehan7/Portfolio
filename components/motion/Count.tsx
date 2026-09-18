'use client';
import { useInView } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useSite } from '@/components/chrome/Providers';
import { dur, ease } from '@/lib/motion';
export function Count({ value, pad = 2 }: { value: number; pad?: number }) {
  const ref = useRef<HTMLSpanElement>(null),
    seen = useInView(ref);
  const { reduced } = useSite();
  const [display, setDisplay] = useState(value);
  const previous = useRef(value);
  useEffect(() => {
    if (reduced || !seen || document.hidden) {
      setDisplay(value);
      previous.current = value;
      return;
    }
    let disposed = false;
    let stop = () => {};
    import('motion').then(({ animate }) => {
      if (disposed) return;
      const control = animate(previous.current, value, {
        duration: dur.fast,
        ease: ease.out,
        onUpdate: (v) => setDisplay(Math.round(v)),
        onComplete: () => {
          previous.current = value;
        },
      });
      stop = () => control.stop();
    });
    const visibility = () => {
      if (document.hidden) {
        stop();
        setDisplay(value);
      }
    };
    document.addEventListener('visibilitychange', visibility);
    return () => {
      disposed = true;
      stop();
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [value, reduced, seen]);
  return (
    <span ref={ref} aria-hidden="true">
      {String(display).padStart(pad, '0')}
    </span>
  );
}
