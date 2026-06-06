import { SITE_URL } from '$lib/config';
import type { RequestHandler } from './$types';

export const prerender = false;

export const GET: RequestHandler = () => {
  const body = `User-agent: *
Allow: /
Disallow: /app/
Disallow: /auth/
Disallow: /github/

Sitemap: ${SITE_URL}/sitemap.xml
`;

  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=86400'
    }
  });
};
