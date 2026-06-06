import { SITE_URL } from '$lib/config';
import type { RequestHandler } from './$types';

export const prerender = false;

// Only public, indexable routes belong here. The /app/* area is private.
const routes = ['/'];

export const GET: RequestHandler = () => {
  const lastmod = new Date().toISOString().slice(0, 10);
  const entries = routes
    .map(
      (path) =>
        `  <url>\n    <loc>${SITE_URL}${path}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>`
    )
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;

  return new Response(body, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=86400'
    }
  });
};
