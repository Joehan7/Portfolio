'use client';
import { useEffect, useRef, useState, Component, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useSite } from '@/components/chrome/Providers';
import { copy } from '@/content/copy';
const HeroField = dynamic(() => import('./HeroField'), { ssr: false });
class CanvasBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
export function HeroStage() {
  const root = useRef<HTMLDivElement>(null);
  const { reduced } = useSite();
  const [eligible, setEligible] = useState(false),
    [visible, setVisible] = useState(false),
    [seen, setSeen] = useState(false),
    [active, setActive] = useState(true);
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const nav = navigator as Navigator & { deviceMemory?: number };
    setEligible(
      matchMedia('(pointer: fine) and (min-width: 900px)').matches && (nav.deviceMemory ?? 8) >= 4,
    );
    const io = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
      if (entry.isIntersecting) setSeen(true);
    });
    io.observe(node);
    const visibility = () => setActive(!document.hidden);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);
  return (
    <div ref={root} className="hero-stage" aria-hidden="true">
      <div className="field-top mono">
        <span>{copy.hero.field}</span>
        <span>{eligible && !reduced ? copy.hero.mode : copy.hero.static}</span>
      </div>
      <Image
        src="/hero-poster.webp"
        alt=""
        fill
        sizes="(max-width: 767px) 100vw, 58vw"
        priority
        className="hero-poster"
      />
      {eligible && seen && (
        <CanvasBoundary>
          <HeroField paused={reduced || !active || !visible} />
        </CanvasBoundary>
      )}
      <div className="field-bottom mono">
        <span>{copy.hero.reading}</span>
        <span>{copy.hero.inspect}</span>
      </div>
    </div>
  );
}
