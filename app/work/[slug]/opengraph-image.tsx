import { makeOG } from '@/lib/og';
import { projects, getProject } from '@/content/projects';
import { profile } from '@/content/profile';
export const runtime = 'nodejs';
export const dynamic = 'force-static';
export function generateStaticParams() { return projects.map(({ slug }) => ({ slug })); }
export const alt = profile.name;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProject(slug);
  return makeOG(p?.title ?? profile.name, p?.outcome ?? profile.subline);
}
