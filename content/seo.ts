import { profile } from './profile';
import { skills } from './skills';
import { education } from './education';
import { copy } from './copy';
import type { Metadata } from 'next';
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000');
export const personSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': `${siteUrl}/#person`,
      name: profile.name,
      url: siteUrl,
      email: profile.email,
      knowsAbout: skills.flatMap((s) => s.items),
      sameAs: profile.socials.map((s) => s.href),
      affiliation: { '@type': 'CollegeOrUniversity', name: education[0].institution },
    },
    {
      '@type': 'WebSite',
      name: copy.brand,
      url: siteUrl,
      inLanguage: 'en',
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${siteUrl}/work?q={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};
export function pageMetadata(
  title: string,
  path: string,
  description = copy.seo.description,
): Metadata {
  const image = `${path === '/' ? '' : path}/opengraph-image${process.env.GITHUB_PAGES === 'true' ? '.png' : ''}`;
  return {
    title,
    description,
    alternates: { canonical: siteUrl + path },
    openGraph: { title, description, url: siteUrl + path, images: [siteUrl + image] },
    twitter: { card: 'summary_large_image', title, description, images: [siteUrl + image] },
  };
}
export function breadcrumbs(name: string, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: copy.home, item: siteUrl },
      { '@type': 'ListItem', position: 2, name, item: siteUrl + path },
    ],
  };
}
