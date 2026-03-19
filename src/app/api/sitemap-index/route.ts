import { generateSitemaps } from '@/app/sitemap';

const BASE_URL = 'https://provider-atlas.com';

export async function GET(): Promise<Response> {
  const sitemaps = await generateSitemaps();

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sitemaps.map(
      ({ id }) =>
        `  <sitemap>\n    <loc>${BASE_URL}/sitemap/${id}.xml</loc>\n    <lastmod>${new Date().toISOString()}</lastmod>\n  </sitemap>`
    ),
    '</sitemapindex>',
  ].join('\n');

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
