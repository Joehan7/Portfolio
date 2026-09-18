'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { copy } from '@/content/copy';
import { useSite } from './Providers';
import { startScrollRuntime } from '@/lib/scrollRuntime';
export function ScrollHUD() {
  const path = usePathname();
  const { reduced } = useSite();
  useEffect(() => startScrollRuntime(reduced), [path, reduced]);
  return (
    <div className="scroll-hud mono" aria-label={copy.hud.label}>
      <span data-progress>000%</span>
      <span className="hud-rule" />
      <span className="hud-section" data-current-section>
        {copy.home}
      </span>
    </div>
  );
}
