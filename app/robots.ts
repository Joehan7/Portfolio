export const dynamic = 'force-static';
import type { MetadataRoute } from 'next';
import { basePath } from '@/lib/assetPath';
import { siteUrl } from '@/content/seo';
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: basePath + '/', disallow: basePath + '/api/' },
    sitemap: siteUrl + '/sitemap.xml',
  };
}
