import { notFound } from 'next/navigation';
import Image from 'next/image';
import { ArrowUpRight, ArrowLeft } from 'lucide-react';
import { projects, getProject } from '@/content/projects';
import { copy } from '@/content/copy';
import { profile } from '@/content/profile';
import { pageMetadata, siteUrl, breadcrumbs } from '@/content/seo';
import { RouteLink } from '@/components/ui/RouteLink';
export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProject(slug);
  return p ? pageMetadata(p.title, '/work/' + slug, p.outcome) : {};
}
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();
  const next = projects[p.index % projects.length],
    previous = projects[(p.index + projects.length - 2) % projects.length];
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CreativeWork',
        name: p.fullTitle,
        description: p.outcome,
        url: siteUrl + '/work/' + slug,
        creator: { '@type': 'Person', name: profile.name },
        keywords: [...p.stack, ...p.domains].join(', '),
      },
      breadcrumbs(p.title, '/work/' + slug),
    ],
  };
  return (
    <main id="main" data-section={p.slug} className="case-study">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}
      />
      <div className="shell page-top case-header">
        <RouteLink href="/work" className="case-back mono">
          <ArrowLeft size={14} />
          {copy.work.overview}
        </RouteLink>
        <div className="case-meta mono">
          <span>{String(p.index).padStart(2, '0')}</span>
          <span>{p.domains.join(' / ')}</span>
          <span className={p.status === 'in-progress' ? 'in-progress' : 'muted'}>
            {p.status === 'in-progress' ? copy.work.progress : copy.work.developed}
          </span>
        </div>
        <h1>{p.title}</h1>
        <p>{p.outcome}</p>
      </div>
      <figure className="case-figure shell">
        <Image
          src={p.media.src}
          alt={p.media.alt}
          width={960}
          height={720}
          sizes="(max-width:767px) 100vw, 80vw"
          priority
        />
        <figcaption className="mono">{copy.work.caseNote}</figcaption>
      </figure>
      <div className="case-body shell">
        <section>
          <h2>{copy.work.problem}</h2>
          <p>{p.problem}</p>
        </section>
        <section>
          <h2>{copy.work.approach}</h2>
          <ol>
            {p.approach.map((step, i) => (
              <li key={step}>
                <span className="mono">{String(i + 1).padStart(2, '0')}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </section>
        <section>
          <h2>{copy.work.result}</h2>
          <ul>
            {p.result.map((result) => (
              <li key={result}>{result}</li>
            ))}
          </ul>
        </section>
        <section>
          <h2>{copy.work.stack}</h2>
          <div className="tech-tags mono">
            {p.stack.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
        </section>
      </div>
      <nav className="case-navigation shell" aria-label={copy.work.related}>
        <RouteLink href={'/work/' + previous.slug}>
          <span className="mono muted">{copy.work.previous}</span>
          <span>
            <ArrowLeft size={20} />
            {previous.title}
          </span>
        </RouteLink>
        <RouteLink href={'/work/' + next.slug}>
          <span className="mono muted">{copy.work.related}</span>
          <span>
            {next.title}
            <ArrowUpRight size={20} />
          </span>
        </RouteLink>
      </nav>
    </main>
  );
}
