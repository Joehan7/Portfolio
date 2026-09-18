import { makeOG } from '@/lib/og';
import { copy } from '@/content/copy';
import { profile } from '@/content/profile';
export const runtime = 'nodejs';
export const dynamic = 'force-static';
export const alt = profile.name;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export default function Image() {
  return makeOG(copy.about.title, profile.subline);
}
