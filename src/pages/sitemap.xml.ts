import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  const site = new URL(request.url).origin;
  let dynamicUrls = '';

  try {
    const { env } = await import('cloudflare:workers');
    const db = env?.DB;
    
    if (db) {
      // Get all blog posts
      const { results: posts } = await db.prepare('SELECT slug, updated_at, created_at FROM blog').all();
      if (posts) {
        for (const post of posts) {
          const date = new Date(post.updated_at || post.created_at || Date.now()).toISOString();
          dynamicUrls += `
    <url>
      <loc>${site}/blog/${post.slug}</loc>
      <lastmod>${date}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`;
        }
      }

      // Get all courses
      const { results: courses } = await db.prepare('SELECT slug FROM courses').all();
      if (courses) {
        for (const course of courses) {
          dynamicUrls += `
    <url>
      <loc>${site}/courses/${course.slug}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.9</priority>
    </url>`;
        }
      }
    }
  } catch (e) {
    console.error('Error generating sitemap:', e);
  }

  // Define static routes
  const staticRoutes = [
    '',
    '/about',
    '/contact',
    '/courses',
    '/blog'
  ];

  const staticUrls = staticRoutes.map(route => `
    <url>
      <loc>${site}${route}</loc>
      <changefreq>daily</changefreq>
      <priority>${route === '' ? '1.0' : '0.8'}</priority>
    </url>`).join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${dynamicUrls}
</urlset>`;

  return new Response(sitemap.trim(), {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
