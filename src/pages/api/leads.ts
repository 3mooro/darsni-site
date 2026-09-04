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

    // @ts-ignore
    const db = locals.runtime?.env?.DB;
    if (!db) {
      console.error("Database connection missing. locals:", JSON.stringify(locals));
      return new Response(JSON.stringify({ error: 'لم يتم ربط قاعدة البيانات D1 في إعدادات Cloudflare Pages. يرجى مراجعة الخطوات.' }), { status: 500 });
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
