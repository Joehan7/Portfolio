import { copy } from '@/content/copy';
import { nav } from '@/content/nav';
import { Terminal } from '@/components/sections/Terminal';
import { RouteLink } from '@/components/ui/RouteLink';
export default function NotFound() {
  return (
    <main id="main" className="shell page-top not-found-page">
      <div className="error-label mono">{copy.notFound.status}</div>
      <div className="not-found-header">
        <span className="error-code mono" aria-hidden="true">
          {copy.notFound.code}
        </span>
        <div>
          <h1>{copy.notFound.title}</h1>
          <p>{copy.notFound.body}</p>
        </div>
      </div>
      <div className="error-routes">
        {nav
          .filter((n) => n.href !== '/resume')
          .map((n) => (
            <RouteLink href={n.href} key={n.href} className="text-link">
              {n.label}
            </RouteLink>
          ))}
      </div>
      <Terminal />
    </main>
  );
}
