'use client';
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { MotionConfig, LazyMotion } from 'motion/react';
import { copy } from '@/content/copy';
import { dur } from '@/lib/motion';
import { scrollToTarget } from '@/lib/scroll';
const loadMotionFeatures = () => import('@/lib/motionFeatures').then((m) => m.default);
const Extras = dynamic(() => import('./Extras'), { ssr: false });
type Context = {
  reduced: boolean;
  toggleMotion: () => void;
  openPalette: () => void;
  paletteOpen: boolean;
  setPaletteOpen: (v: boolean) => void;
  navigate: (href: string) => void;
};
const MotionContext = createContext<Context>({
  reduced: true,
  toggleMotion: () => {},
  openPalette: () => {},
  paletteOpen: false,
  setPaletteOpen: () => {},
  navigate: () => {},
});
export const useSite = () => useContext(MotionContext);
export function Providers({ children }: { children: React.ReactNode }) {
  const [reduced, setReduced] = useState(true),
    [paletteOpen, setPaletteOpen] = useState(false),
    [announcement, setAnnouncement] = useState(''),
    [wipe, setWipe] = useState<'idle' | 'cover' | 'reveal'>('idle');
  const pathname = usePathname(),
    router = useRouter(),
    timers = useRef<ReturnType<typeof setTimeout>[]>([]),
    pending = useRef(false),
    lastPath = useRef(pathname);
  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      const saved = localStorage.getItem('signal-motion');
      setReduced(saved ? saved === 'reduced' : media.matches);
    };
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.motion = reduced ? 'reduced' : 'full';
    if (reduced) {
      setWipe('idle');
      pending.current = false;
      clearTimers();
    }
  }, [reduced, clearTimers]);
  const toggleMotion = useCallback(
    () =>
      setReduced((value) => {
        const next = !value;
        localStorage.setItem('signal-motion', next ? 'reduced' : 'full');
        setAnnouncement(next ? copy.footer.motionDisabled : copy.footer.motionEnabled);
        return next;
      }),
    [],
  );
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen((value) => !value);
      }
    };
    addEventListener('keydown', key);
    return () => removeEventListener('keydown', key);
  }, []);
  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    setPaletteOpen(false);
    const main = document.getElementById('main');
    if (main) {
      main.tabIndex = -1;
      main.focus({ preventScroll: true });
    }
    if (pending.current) {
      setWipe('reveal');
      pending.current = false;
      scrollToTarget(0, true);
      timers.current.push(setTimeout(() => setWipe('idle'), dur.transition * 500));
    }
    if (!reduced && main) {
      const animation = main.animate(
        [
          { opacity: 0.72, transform: 'translateY(8px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        { duration: dur.fast * 1000, easing: 'cubic-bezier(.16,1,.3,1)' },
      );
      return () => animation.cancel();
    }
  }, [pathname, reduced]);
  useEffect(() => clearTimers, [clearTimers]);
  const navigate = useCallback(
    (href: string) => {
      setPaletteOpen(false);
      if (reduced || href.includes('#') || href.split('?')[0] === pathname) {
        router.push(href);
        return;
      }
      clearTimers();
      pending.current = true;
      setWipe('cover');
      router.prefetch(href);
      timers.current.push(setTimeout(() => router.push(href), dur.transition * 500));
      // A failed or cancelled navigation must never strand a visitor behind the curtain.
      timers.current.push(
        setTimeout(() => {
          pending.current = false;
          setWipe('idle');
        }, 5000),
      );
    },
    [pathname, reduced, router, clearTimers],
  );
  return (
    <MotionContext
      value={{
        reduced,
        toggleMotion,
        paletteOpen,
        setPaletteOpen,
        openPalette: () => setPaletteOpen(true),
        navigate,
      }}
    >
      <LazyMotion features={loadMotionFeatures} strict>
        <MotionConfig reducedMotion={reduced ? 'always' : 'never'}>
          {children}
          <Extras />
          <div className={`page-wipe ${wipe}`} aria-hidden="true">
            <span className="wipe-rule" />
          </div>
          <div className="sr-only" role="status">
            {announcement}
          </div>
        </MotionConfig>
      </LazyMotion>
    </MotionContext>
  );
}
