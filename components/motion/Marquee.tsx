'use client';
import { Pause, Play } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { copy } from '@/content/copy';
import { useSite } from '@/components/chrome/Providers';
import { dur, physics } from '@/lib/motion';
export function Marquee({
  items,
  reverse = false,
  editorial = false,
}: {
  items: string[];
  reverse?: boolean;
  editorial?: boolean;
}) {
  const [paused, setPaused] = useState(false),
    [visible, setVisible] = useState(false),
    [foreground, setForeground] = useState(true);
  const ref = useRef<HTMLDivElement>(null),
    track = useRef<HTMLDivElement>(null);
  const { reduced } = useSite();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    observer.observe(el);
    const visibility = () => setForeground(!document.hidden);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);
  useEffect(() => {
    if (!editorial || reduced || !visible || !foreground || paused) return;
    const trackNode = track.current;
    const animations = trackNode?.getAnimations() ?? [];
    let last = window.scrollY,
      time = performance.now(),
      settle: ReturnType<typeof setTimeout>;
    const speed = () => {
      const now = performance.now(),
        delta = window.scrollY - last;
      const velocity = delta / Math.max(now - time, 16);
      const rate = Math.max(
        -physics.maxMarqueeSpeed,
        Math.min(physics.maxMarqueeSpeed, 1 + velocity * physics.marqueeCoupling),
      );
      animations.forEach((a) => a.updatePlaybackRate(rate));
      last = window.scrollY;
      time = now;
      clearTimeout(settle);
      settle = setTimeout(
        () => animations.forEach((a) => a.updatePlaybackRate(1)),
        dur.fast * 1000,
      );
    };
    addEventListener('scroll', speed, { passive: true });
    return () => {
      removeEventListener('scroll', speed);
      clearTimeout(settle);
      animations.forEach((a) => a.updatePlaybackRate(1));
    };
  }, [editorial, reduced, visible, foreground, paused]);
  const running = !paused && visible && foreground && !reduced;
  return (
    <div
      ref={ref}
      className={`marquee ${reverse ? 'reverse' : ''} ${editorial ? 'editorial' : ''} ${running ? '' : 'paused'}`}
    >
      <ul className="sr-only">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <div ref={track} className="marquee-track" aria-hidden="true">
        {[...items, ...items].map((item, i) => (
          <span key={i}>
            {item}
            <span className="marquee-separator">{editorial ? ' / ' : '+'}</span>
          </span>
        ))}
      </div>
      <button
        className="marquee-control"
        aria-label={paused ? copy.credibility.play : copy.credibility.pause}
        aria-pressed={paused}
        onClick={() => setPaused(!paused)}
      >
        {paused ? <Play size={12} /> : <Pause size={12} />}
      </button>
    </div>
  );
}
