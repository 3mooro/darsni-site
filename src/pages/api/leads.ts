import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const data = await request.json();
    const { name, phone, course, message } = data;

    if (!name || !phone) {
      return new Response(JSON.stringify({ error: 'الاسم ورقم الجوال مطلوبان' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let db;
    try {
      const { env } = await import('cloudflare:workers');
      db = env?.DB;
    } catch (e) {
      console.warn("Could not import cloudflare:workers", e);
    }

    if (!db) {
      console.error("Database connection missing.");
      return new Response(JSON.stringify({ error: 'لم يتم العثور على قاعدة البيانات. تأكد من ربط DB في إعدادات Cloudflare.' }), { status: 500 });
    }

    await db.prepare('INSERT INTO messages (name, phone, course, message) VALUES (?, ?, ?, ?)')
      .bind(name, phone, course || '', message || '')
      .run();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error handling lead:', error);
    return new Response(JSON.stringify({ error: error.message || 'حدث خطأ داخلي' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
