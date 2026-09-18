'use client';
import { useEffect, useRef, useState } from 'react';
import { Search, X, ArrowUpRight } from 'lucide-react';
import { useSite } from './Providers';
import { useDialog } from '@/lib/useDialog';
import { copy } from '@/content/copy';
import { profile } from '@/content/profile';
import { nav } from '@/content/nav';
import { projects } from '@/content/projects';
import { skills } from '@/content/skills';
import { fuzzyScore } from '@/lib/search';
export default function CommandPalette() {
  const { paletteOpen, setPaletteOpen, navigate, toggleMotion } = useSite();
  const dialog = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState(''),
    [selected, setSelected] = useState(0),
    [recent, setRecent] = useState<string[]>([]),
    [status, setStatus] = useState('');
  useDialog(dialog, paletteOpen, () => setPaletteOpen(false));
  useEffect(() => {
    try {
      setRecent(JSON.parse(localStorage.getItem('signal-recent') || '[]'));
    } catch {}
  }, []);
  const entries = [
    ...nav.map((n) => ({
      id: n.href,
      title: n.label,
      group: copy.palette.pages,
      action: () => navigate(n.href),
    })),
    ...projects.map((p) => ({
      id: '/work/' + p.slug,
      title: p.title,
      group: copy.search.projects,
      search: p.stack.join(' '),
      action: () => navigate('/work/' + p.slug),
    })),
    ...skills.map((s) => ({
      id: s.domain,
      title: s.domain,
      search: s.items.join(' '),
      group: copy.search.skills,
      action: () => navigate('/work?domain=' + encodeURIComponent(s.domain)),
    })),
    {
      id: 'copy',
      title: copy.palette.copy,
      group: copy.palette.actions,
      action: async () => {
        try {
          await navigator.clipboard.writeText(profile.email);
          setStatus(copy.contact.copied);
        } catch {
          setStatus(copy.contact.copyFailed);
        }
      },
    },
    {
      id: 'download',
      title: copy.palette.download,
      group: copy.palette.actions,
      action: () => {
        const a = document.createElement('a');
        a.href = profile.resumePdf;
        a.download = 'resume.pdf';
        a.click();
        setPaletteOpen(false);
      },
    },
    {
      id: 'motion',
      title: copy.palette.toggle,
      group: copy.palette.actions,
      action: () => {
        toggleMotion();
        setPaletteOpen(false);
      },
    },
  ];
  const results = entries
    .map((item) => ({
      ...item,
      score: query
        ? fuzzyScore(query, item.title + ' ' + ('search' in item ? item.search : ''))
        : recent.includes(item.id)
          ? 10
          : 1,
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  const run = (index: number) => {
    const item = results[index];
    if (!item) return;
    const items = [item.id, ...recent.filter((r) => r !== item.id)].slice(0, 5);
    localStorage.setItem('signal-recent', JSON.stringify(items));
    setRecent(items);
    void item.action();
  };
  return (
    <dialog ref={dialog} className="command-dialog" aria-labelledby="command-title">
      <div className="command-head">
        <h2 id="command-title">{copy.palette.title}</h2>
        <button onClick={() => setPaletteOpen(false)} aria-label={copy.palette.close}>
          <X size={20} />
        </button>
      </div>
      <div className="command-input">
        <Search size={20} />
        <input
          autoComplete="off"
          aria-label={copy.palette.searchLabel}
          placeholder={copy.palette.placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(0);
          }}
          role="combobox"
          aria-expanded="true"
          aria-controls="command-results"
          aria-activedescendant={results[selected] ? `command-${selected}` : undefined}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setSelected((i) => (i + 1) % Math.max(1, results.length));
            }
            if (e.key === 'ArrowUp') {
              e.preventDefault();
              setSelected((i) => (i - 1 + results.length) % Math.max(1, results.length));
            }
            if (e.key === 'Enter') {
              e.preventDefault();
              run(selected);
            }
          }}
        />
      </div>
      <ul id="command-results" role="listbox">
        {results.map((item, i) => (
          <li
            key={item.id}
            id={`command-${i}`}
            role="option"
            aria-selected={i === selected}
            tabIndex={-1}
            onMouseEnter={() => setSelected(i)}
            onClick={() => run(i)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') run(i);
            }}
          >
            <div className="command-option">
              <span>
                {item.title}
                <small>
                  {!query && recent.includes(item.id) ? copy.palette.recent : item.group}
                </small>
              </span>
              <ArrowUpRight size={16} />
            </div>
          </li>
        ))}
      </ul>
      {!results.length && <p className="command-empty">{copy.palette.noResults}</p>}
      <div className="command-foot mono">
        <span>↑ ↓ {copy.palette.hint}</span>
        <span>↵ {copy.palette.select}</span>
        <span>esc {copy.palette.escape}</span>
      </div>
      <p className="sr-only" role="status">
        {status}
      </p>
    </dialog>
  );
}
