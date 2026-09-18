'use client';
import { assetPath } from '@/lib/assetPath';
import { ArrowUp, ArrowUpRight, Copy, Check, Pause, Play } from 'lucide-react';
import { useState } from 'react';
import { profile } from '@/content/profile';
import { copy } from '@/content/copy';
import { nav } from '@/content/nav';
import { RouteLink } from '@/components/ui/RouteLink';
import { scrollToTarget } from '@/lib/scroll';
import { useSite } from './Providers';
export function ContactRows() {
  const [copied, setCopied] = useState(false),
    [status, setStatus] = useState('');
  return (
    <div className="contact-rows">
      <div className="contact-row">
        <span>{copy.contact.email}</span>
        <a href={`mailto:${profile.email}`}>{profile.email}</a>
        <button
          data-cursor="copy"
          aria-label={copy.contact.copy}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(profile.email);
              setCopied(true);
              setStatus(copy.contact.copied);
            } catch {
              setStatus(copy.contact.copyFailed);
            }
          }}
        >
          {copied ? <Check size={19} /> : <Copy size={19} />}
        </button>
      </div>
      <div className="contact-row">
        <span>{copy.contact.phone}</span>
        <a href={`tel:${profile.phone.replace(/\s/g, '')}`}>{profile.phone}</a>
        <ArrowUpRight size={19} aria-hidden="true" />
      </div>
      <span className="sr-only" role="status">
        {status}
      </span>
    </div>
  );
}
export function Footer() {
  const { reduced, toggleMotion } = useSite();
  return (
    <footer id="footer" className="footer shell">
      <div className="footer-callout">
        <p>{copy.footer.title}</p>
        <RouteLink href="/contact" className="circle-link" aria-label={copy.header.cta}>
          <ArrowUpRight size={30} />
        </RouteLink>
      </div>
      <ContactRows />
      <div className="footer-links">
        <RouteLink href="/" className="wordmark footer-wordmark">
          {profile.shortName}
        </RouteLink>
        <div>
          <span className="muted small">{copy.footer.explore}</span>
          {nav.slice(0, 3).map((item) => (
            <RouteLink key={item.href} href={item.href}>
              {item.label}
            </RouteLink>
          ))}
        </div>
        <div>
          <span className="muted small">{copy.footer.connect}</span>
          <RouteLink href="/contact">{nav[3].label}</RouteLink>
          <a href={`mailto:${profile.email}`}>{copy.contact.emailLink}</a>
        </div>
        <div>
          <span className="muted small">{copy.footer.resources}</span>
          <a href={profile.resumePdf} download>
            {copy.hero.resume}
          </a>
          <a href={assetPath('/llms.txt')}>{copy.footer.llms}</a>
          <a href={assetPath('/sitemap.xml')}>{copy.footer.sitemap}</a>
        </div>
      </div>
      <div className="footer-bottom mono">
        <span>
          © {new Date().getFullYear()} {copy.footer.copyright}
        </span>
        <span>{copy.footer.stamp}</span>
        <button onClick={toggleMotion} aria-pressed={!reduced}>
          {reduced ? <Play size={12} /> : <Pause size={12} />}{' '}
          {reduced ? copy.footer.motionOff : copy.footer.motionOn}
        </button>
        <button onClick={() => scrollToTarget(0, reduced)}>
          {copy.footer.top}
          <ArrowUp size={13} />
        </button>
      </div>
    </footer>
  );
}
