'use client';
import { useEffect, useState } from 'react';
import { ArrowUpRight, Search, X } from 'lucide-react';
import { Count } from '@/components/motion/Count';
import { copy } from '@/content/copy';
import { searchContent } from '@/lib/search';
import { projects } from '@/content/projects';
import { RouteLink } from '@/components/ui/RouteLink';
export function SignalSearch() {
  const [input, setInput] = useState(''),
    [query, setQuery] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setQuery(input.trim()), 120);
    return () => clearTimeout(timer);
  }, [input]);
  const result = searchContent(query);
  const count = query ? result.projects.length + result.skills.length : 0;
  return (
    <section id="find" className="section signal-search" data-section="find">
      <div className="shell search-shell">
        <div className="section-head">
          <h2>{copy.search.title}</h2>
          <p>{copy.search.intro}</p>
        </div>
        <div className="signal-input">
          <Search size={24} />
          <input
            aria-label={copy.search.label}
            placeholder={copy.search.placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoComplete="off"
            spellCheck="false"
          />
          {input && (
            <button onClick={() => setInput('')} aria-label={copy.search.clear}>
              <X size={20} />
            </button>
          )}
          <span className="mono match-count" role="status" aria-live="polite">
            <span className="sr-only">
              {count} {copy.search.matches}
            </span>
            <span aria-hidden="true">
              <Count value={count} /> {copy.search.matches}
            </span>
          </span>
        </div>
        <div className="preset-tags">
          {copy.search.presets.map((preset) => (
            <button
              key={preset}
              onClick={() => setInput(preset)}
              className={input === preset ? 'active' : ''}
            >
              {preset}
            </button>
          ))}
        </div>
        {!query ? (
          <p className="search-invitation">{copy.search.empty}</p>
        ) : (
          <div className="search-results">
            {count === 0 && <p className="muted">{copy.search.none}</p>}
            <div className="search-projects">
              {(count === 0 ? projects.slice(0, 1) : result.projects).map((project) => (
                <RouteLink key={project.slug} href={`/work/${project.slug}`}>
                  <span>
                    {project.title}
                    <small>{project.outcome}</small>
                  </span>
                  <ArrowUpRight size={18} />
                </RouteLink>
              ))}
            </div>
            {result.skills.length > 0 && (
              <div className="search-skill-results">
                <span className="mono muted">{copy.search.skills}</span>
                {result.skills.map((skill) => (
                  <p key={skill.domain}>
                    <strong>{skill.domain}</strong>
                    <span>{skill.items.join(' / ')}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
