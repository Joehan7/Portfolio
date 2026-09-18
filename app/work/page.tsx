import { Suspense } from 'react';
import { PagesWorkIndex } from '@/components/sections/PagesWorkIndex';
import { WorkIndex } from '@/components/sections/WorkIndex';
import { copy } from '@/content/copy';
import { pageMetadata } from '@/content/seo';
export const metadata = pageMetadata(copy.work.indexTitle, '/work');
async function Content({
  searchParams,
}: {
  searchParams: Promise<{ domain?: string; q?: string }>;
}) {
  const { domain, q } = await searchParams;
  return <WorkIndex initialDomain={domain} initialQuery={q} />;
}
export default function WorkPage({
  searchParams,
}: {
  searchParams: Promise<{ domain?: string; q?: string }>;
}) {
  return (
    <main id="main" data-section="work" className="shell page-top work-index">
      <div className="section-label mono">{copy.work.label}</div>
      <h1>{copy.work.indexTitle}</h1>
      <p className="page-intro">{copy.work.indexIntro}</p>
      <Suspense fallback={<WorkIndex />}>
        {process.env.GITHUB_PAGES === 'true' ? <PagesWorkIndex /> : <Content searchParams={searchParams} />}
      </Suspense>
    </main>
  );
}
