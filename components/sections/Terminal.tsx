'use client';
import { useState, useEffect } from 'react';
import { useSite } from '@/components/chrome/Providers';
import { copy } from '@/content/copy';
import { profile } from '@/content/profile';
import { nav } from '@/content/nav';
export function Terminal() {
  const [input, setInput] = useState(''),
    [lines, setLines] = useState([copy.notFound.intro]),
    [started, setStarted] = useState(false),
    [expired, setExpired] = useState(false),
    [session, setSession] = useState(0);
  const { navigate } = useSite();
  useEffect(() => {
    if (!started) return;
    const timer = setTimeout(() => {
      setExpired(true);
      setLines((old) => [...old, copy.notFound.timeout]);
    }, 20000);
    return () => clearTimeout(timer);
  }, [started, session]);
  const run = (e: React.FormEvent) => {
    e.preventDefault();
    if (expired) return;
    setStarted(true);
    const command = input.trim().toLowerCase();
    let result = copy.notFound.unknown;
    if (command === 'help') result = copy.notFound.help;
    else if (command === 'whoami') result = profile.name;
    else if (command === 'ls') result = nav.map((n) => n.href).join('\n');
    else if (command === 'work' || command === 'contact') {
      navigate('/' + command);
      return;
    }
    setLines((old) => [...old.slice(-9), copy.notFound.prompt + ' ' + input, result]);
    setInput('');
  };
  return (
    <div className="terminal">
      <header className="mono">
        <span>{copy.notFound.terminal}</span>
        <a href="#footer">{copy.notFound.skip}</a>
      </header>
      <div className="terminal-output" role="log" aria-live="polite">
        {lines.join('\n')}
      </div>
      {expired ? (
        <button
          className="terminal-restart"
          onClick={() => {
            setExpired(false);
            setStarted(false);
            setSession((s) => s + 1);
            setLines([copy.notFound.intro]);
          }}
        >
          {copy.notFound.reset}
        </button>
      ) : (
        <form onSubmit={run}>
          <label htmlFor="terminal-input">{copy.notFound.prompt}</label>
          <input
            id="terminal-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={copy.notFound.placeholder}
            autoComplete="off"
            spellCheck="false"
          />
          <button type="submit">{copy.notFound.run}</button>
        </form>
      )}
    </div>
  );
}
