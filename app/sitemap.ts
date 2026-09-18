export const dynamic = 'force-static';
import type { MetadataRoute } from 'next';
import { routes } from '@/content/nav';
import { projects } from '@/content/projects';
import { siteUrl } from '@/content/seo';
export default function sitemap(): MetadataRoute.Sitemap {
  return [...routes, ...projects.map((p) => '/work/' + p.slug)].map((route) => ({
    url: siteUrl + route,
    changeFrequency: 'monthly',
    priority: route === '/' ? 1 : route === '/work' ? 0.9 : 0.7,
  }));
}
