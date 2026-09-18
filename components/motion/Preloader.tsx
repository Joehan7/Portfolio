'use client';
import { useEffect, useState } from 'react';
import { useSite } from '@/components/chrome/Providers';
import { copy } from '@/content/copy';
export function Preloader() {
  const { reduced } = useSite();
  const [state, setState] = useState<'off' | 'load' | 'exit'>('off'),
    [progress, setProgress] = useState(0);
  useEffect(() => {
    if (reduced || sessionStorage.getItem('signal-loaded') || performance.now() > 5000) return;
    let stopped = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const start = performance.now();
    setState('load');
    document.documentElement.dataset.intro = 'loading';
    let done = 0;
    const assets = [
      document.fonts.load('400 16px ' + getComputedStyle(document.body).fontFamily),
      document.fonts.ready,
    ];
    const completed = () => {
      if (!stopped) setProgress(Math.round((++done / assets.length) * 100));
    };
    let exiting = false;
    const exit = () => {
      if (stopped || exiting) return;
      exiting = true;
      timers.push(
        setTimeout(
          () => {
            if (stopped) return;
            setProgress(100);
            setState('exit');
            document.documentElement.dataset.intro = 'ready';
            sessionStorage.setItem('signal-loaded', '1');
            timers.push(setTimeout(() => setState('off'), 1150));
          },
          Math.max(120, 700 - (performance.now() - start)),
        ),
      );
    };
    Promise.allSettled(assets.map((a) => a.then(completed, completed))).then(exit);
    timers.push(setTimeout(exit, 1400));
    return () => {
      stopped = true;
      timers.forEach(clearTimeout);
      document.documentElement.dataset.intro = 'ready';
      setState('off');
    };
  }, [reduced]);
  if (state === 'off' || reduced) return null;
  return (
    <div className={`preloader ${state}`} aria-hidden="true">
      <div className="curtain top" />
      <div className="curtain bottom" />
      <div className="loader-content mono">
        <span>{copy.preloader.label}</span>
        <span>
          {String(progress).padStart(3, '0')}
          {copy.preloader.percent}
        </span>
      </div>
      <div className="loader-rule" style={{ transform: `scaleX(${progress / 100})` }} />
    </div>
  );
}
