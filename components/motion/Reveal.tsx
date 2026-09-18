'use client';
import { useRef, useEffect } from 'react';
import { useSite } from '@/components/chrome/Providers';
export function Reveal({
  children,
  kind = 'text',
  className = '',
}: {
  children: React.ReactNode;
  kind?: 'text' | 'heading' | 'media';
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { reduced } = useSite();
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    el.dataset.reveal = 'pending';
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          el.dataset.reveal = 'shown';
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      delete el.dataset.reveal;
    };
  }, [reduced]);
  return (
    <div ref={ref} className={`reveal reveal-${kind} ${className}`}>
      {children}
    </div>
  );
}
