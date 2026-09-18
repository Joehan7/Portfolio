'use client';
import * as m from 'motion/react-m';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { ArrowUpRight, ChevronDown, Menu, Search, X, Download } from 'lucide-react';
import { nav } from '@/content/nav';
import { profile } from '@/content/profile';
import { projects } from '@/content/projects';
import { skills } from '@/content/skills';
import { copy } from '@/content/copy';
import { RouteLink } from '@/components/ui/RouteLink';
import { usePathname } from 'next/navigation';
import { useSite } from './Providers';
import { useDialog } from '@/lib/useDialog';
import { dur, ease } from '@/lib/motion';
export function Header() {
  const [mega, setMega] = useState(false),
    [drawer, setDrawer] = useState(false);
  const root = useRef<HTMLElement>(null),
    dialog = useRef<HTMLDialogElement>(null),
    pathname = usePathname();
  const { openPalette, reduced } = useSite();
  useDialog(dialog, drawer, () => setDrawer(false));
  useEffect(() => {
    setMega(false);
    setDrawer(false);
  }, [pathname]);
  useEffect(() => {
    if (!mega) return;
    const down = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setMega(false);
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMega(false);
        root.current?.querySelector<HTMLButtonElement>('[data-mega-trigger]')?.focus();
      }
    };
    addEventListener('pointerdown', down);
    addEventListener('keydown', key);
    return () => {
      removeEventListener('pointerdown', down);
      removeEventListener('keydown', key);
    };
  }, [mega]);
  return (
    <header
      ref={root}
      className="header"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) setMega(false);
      }}
    >
      <span className="header-progress" aria-hidden="true" />
      <div className="header-inner shell">
        <RouteLink href="/" className="wordmark" aria-label={`${profile.name} ${copy.home}`}>
          {profile.shortName}
          <span className="wordmark-line" aria-hidden="true" />
        </RouteLink>
        <nav aria-label={copy.header.navigation} className="desktop-nav">
          <div className="work-nav">
            <RouteLink href="/work">{nav[0].label}</RouteLink>
            <button
              data-mega-trigger
              aria-label={copy.header.featured}
              aria-expanded={mega}
              aria-controls="mega-menu"
              onClick={() => setMega(!mega)}
              onKeyDown={(event) => {
                if (event.key === 'ArrowDown') {
                  event.preventDefault();
                  setMega(true);
                  setTimeout(
                    () => root.current?.querySelector<HTMLAnchorElement>('#mega-menu a')?.focus(),
                    50,
                  );
                }
              }}
            >
              <ChevronDown size={12} />
            </button>
          </div>
          {nav.slice(1).map((item) => (
            <RouteLink
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? 'page' : undefined}
            >
              {item.label}
            </RouteLink>
          ))}
        </nav>
        <div className="header-actions">
          <button
            className="search-button"
            onClick={(event) => {
              event.currentTarget.focus();
              openPalette();
            }}
            aria-label={copy.header.search}
          >
            <Search size={16} />
            <kbd>{copy.header.keyboard}</kbd>
          </button>
          <RouteLink href="/contact" className="header-cta">
            {copy.header.cta}
            <ArrowUpRight size={15} />
          </RouteLink>
          <button
            className="mobile-toggle"
            aria-label={copy.header.menu}
            aria-expanded={drawer}
            onClick={(event) => {
              event.currentTarget.focus();
              setDrawer(true);
            }}
          >
            <Menu />
          </button>
        </div>
      </div>
      <AnimatePresence>
        {mega && (
          <m.div
            id="mega-menu"
            className="mega"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: reduced ? 0 : dur.fast, ease: ease.out }}
            onKeyDown={(event) => {
              if (['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].includes(event.key)) {
                event.preventDefault();
                const links = Array.from(
                  event.currentTarget.querySelectorAll<HTMLAnchorElement>('a'),
                );
                const current = links.indexOf(document.activeElement as HTMLAnchorElement);
                links[
                  (current +
                    (event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : -1) +
                    links.length) %
                    links.length
                ]?.focus();
              }
            }}
          >
            <div className="mega-inner shell">
              <div>
                <p className="small muted">{copy.header.featured}</p>
                {projects.slice(0, 3).map((project) => (
                  <RouteLink
                    href={`/work/${project.slug}`}
                    key={project.slug}
                    className="mega-project"
                  >
                    <span className="mono">{String(project.index).padStart(2, '0')}</span>
                    <span>
                      {project.title}
                      <small>{project.outcome}</small>
                    </span>
                    <ArrowUpRight size={16} />
                  </RouteLink>
                ))}
              </div>
              <div>
                <p className="small muted">{copy.header.domains}</p>
                {skills.map((skill) => (
                  <RouteLink
                    key={skill.domain}
                    href={`/work?domain=${encodeURIComponent(skill.domain)}`}
                  >
                    {skill.domain}
                  </RouteLink>
                ))}
              </div>
              <div>
                <p className="small muted">{copy.header.artefacts}</p>
                <a href={profile.resumePdf} download>
                  {copy.hero.resume}
                  <Download size={14} />
                </a>
                <RouteLink href="/resume">{nav[2].label}</RouteLink>
                <RouteLink href="/work">{copy.header.all}</RouteLink>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
      <dialog ref={dialog} className="mobile-drawer" aria-label={copy.header.navigation}>
        <div className="drawer-top">
          <span className="wordmark">{profile.shortName}</span>
          <button onClick={() => setDrawer(false)} aria-label={copy.header.close}>
            <X />
          </button>
        </div>
        <nav>
          {nav.map((item, i) => (
            <m.div
              key={item.href}
              initial={false}
              animate={{ opacity: drawer ? 1 : 0, y: reduced ? 0 : drawer ? 0 : 12 }}
              transition={{ duration: dur.fast, delay: reduced ? 0 : i * dur.stagger }}
            >
              <RouteLink href={item.href} onClick={() => setDrawer(false)}>
                {item.label}
                <ArrowUpRight />
              </RouteLink>
            </m.div>
          ))}
        </nav>
        <a href={`mailto:${profile.email}`} className="drawer-email">
          {profile.email}
        </a>
      </dialog>
    </header>
  );
}
