'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useSite } from './Providers';
import { ScrollHUD } from './ScrollHUD';
import { Preloader } from '@/components/motion/Preloader';
import { physics } from '@/lib/motion';
import type { ScrollDetail } from '@/lib/scroll';
const Palette = dynamic(() => import('./CommandPalette'));
const Cursor = dynamic(() => import('./Cursor'), { ssr: false });
const Analytics = dynamic(() => import('./Analytics'));
export default function Extras() {
  const { reduced, paletteOpen } = useSite();
  const pathname = usePathname();
  useEffect(() => {
    if (reduced || matchMedia('(pointer: coarse)').matches) return;
    let disposed = false;
    let cleanup = () => {};
    Promise.all([import('lenis'), import('gsap'), import('gsap/ScrollTrigger')]).then(
      ([{ default: Lenis }, { gsap }, { ScrollTrigger }]) => {
        if (disposed) return;
        gsap.registerPlugin(ScrollTrigger);
        const lenis = new Lenis({
          lerp: physics.scrollLerp,
          wheelMultiplier: 1,
          smoothWheel: true,
          syncTouch: false,
          anchors: { offset: -90 },
          prevent: (node) => !!node.closest('dialog'),
        });
        const tick = (time: number) => lenis.raf(time * 1000);
        const sync = () => ScrollTrigger.update();
        const visibility = () => {
          if (document.hidden) {
            gsap.ticker.remove(tick);
            lenis.stop();
          } else {
            lenis.start();
            gsap.ticker.add(tick);
          }
        };
        const jump = (event: Event) => {
          const e = event as CustomEvent<ScrollDetail>;
          e.preventDefault();
          lenis.scrollTo(e.detail.target, {
            immediate: e.detail.immediate,
            offset: e.detail.offset ?? 0,
            force: true,
          });
        };
        lenis.on('scroll', sync);
        gsap.ticker.lagSmoothing(0);
        gsap.ticker.add(tick);
        document.addEventListener('visibilitychange', visibility);
        window.addEventListener('signal:scroll', jump);
        document.documentElement.dataset.lenis = '1';
        cleanup = () => {
          gsap.ticker.remove(tick);
          lenis.off('scroll', sync);
          lenis.destroy();
          document.removeEventListener('visibilitychange', visibility);
          window.removeEventListener('signal:scroll', jump);
          document.documentElement.dataset.lenis = '0';
        };
      },
    );
    return () => {
      disposed = true;
      cleanup();
    };
  }, [reduced, pathname]);
  return (
    <>
      {process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true' && <Analytics />}
      <Preloader />
      <ScrollHUD />
      {!reduced && <Cursor />}
      {paletteOpen && <Palette />}
    </>
  );
}
