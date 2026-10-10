import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/config';

export const dynamic = 'force-static';

const ROUTES = [
  { path: '', priority: 1 },
  { path: '/sobre', priority: 0.8 },
  { path: '/servicos', priority: 0.9 },
  { path: '/portfolio', priority: 0.7 },
  { path: '/sustentabilidade', priority: 0.7 },
  { path: '/contato', priority: 0.8 },
  { path: '/politica-de-privacidade', priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const trailing = process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true' ? '/' : '';
  return ROUTES.map((r) => ({
    url: `${siteUrl}${r.path}${r.path ? trailing : '/'}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: r.priority,
  }));
}
