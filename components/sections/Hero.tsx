import { ArrowDown, ArrowUpRight, Download } from 'lucide-react';
import { profile } from '@/content/profile';
import { copy } from '@/content/copy';
import { RouteLink } from '@/components/ui/RouteLink';
import { Magnetic } from '@/components/motion/Magnetic';
import { HeroStage } from '@/components/three/HeroStage';
export function Hero() {
  return (
    <section className="hero shell" data-section="intro">
      <div className="hero-topline">
        <span className="mono">{copy.hero.label}</span>
        <span className="mono muted">{profile.location}</span>
      </div>
      <HeroStage />
      <div className="hero-content">
        <h1>
          {profile.headline.map((line, i) => (
            <span className="hero-line" key={line} style={{ '--line': i } as React.CSSProperties}>
              {line}
            </span>
          ))}
        </h1>
        <div className="hero-description">
          <span className="hero-cross" aria-hidden="true">
            +
          </span>
          <p>{profile.subline}</p>
        </div>
        <div className="hero-actions">
          <Magnetic>
            <RouteLink href="/work" className="button primary">
              {copy.hero.work}
              <ArrowUpRight size={17} />
            </RouteLink>
          </Magnetic>
          <a href={profile.resumePdf} download className="button ghost">
            {copy.hero.resume}
            <Download size={15} />
          </a>
        </div>
      </div>
      <div className="hero-baseline">
        <a href="#work" className="mono scroll-cue">
          <ArrowDown size={14} />
          {copy.hero.cue}
        </a>
        <span className="mono">{copy.hero.discipline}</span>
      </div>
    </section>
  );
}
