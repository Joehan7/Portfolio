'use client';
import { useState, useEffect } from 'react';
import { projects } from '@/content/projects';
import { skills } from '@/content/skills';
import { copy } from '@/content/copy';
import { ProjectBand } from './SelectedWork';
import { searchContent } from '@/lib/search';
export function WorkIndex({
  initialDomain = '',
  initialQuery = '',
}: {
  initialDomain?: string;
  initialQuery?: string;
}) {
  const [domain, setDomain] = useState(initialDomain),
    [query, setQuery] = useState(initialQuery);
  useEffect(() => {
    setDomain(initialDomain);
    setQuery(initialQuery);
  }, [initialDomain, initialQuery]);
  const base = query ? searchContent(query).projects : projects;
  const selected = base.filter((p) => !domain || p.domains.includes(domain));
  return (
    <>
      <div className="work-filters" aria-label={copy.work.filter}>
        {['', ...skills.map((s) => s.domain)].map((item) => (
          <button key={item} onClick={() => setDomain(item)} aria-pressed={domain === item}>
            {item || copy.work.allFilter}
          </button>
        ))}
      </div>
      <div className="work-search">
        <label className="sr-only" htmlFor="work-search">
          {copy.search.label}
        </label>
        <input
          id="work-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={copy.search.placeholder}
        />
        <span className="mono" role="status">
          {selected.length} {copy.search.matches}
        </span>
      </div>
      {selected.length ? (
        selected.map((p) => <ProjectBand key={p.slug} project={p} />)
      ) : (
        <p className="work-empty">{copy.search.none}</p>
      )}
    </>
  );
}
