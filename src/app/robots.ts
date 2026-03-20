import type { MetadataRoute } from 'next';
import { BASE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/dashboard/', '/api/', '/auth/'] },
      { userAgent: ['GPTBot', 'OAI-SearchBot', 'ClaudeBot', 'PerplexityBot', 'Applebot-Extended'], allow: '/' },
      { userAgent: ['CCBot', 'anthropic-ai', 'cohere-ai', 'Google-Extended'], disallow: '/' },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
