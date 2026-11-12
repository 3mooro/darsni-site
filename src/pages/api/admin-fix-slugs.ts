import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

// ONE-TIME slug cleanup for the Darsni blog (2026-11-13): renames every legacy
// slug (Arabic titles / typed fragments) to a clean English slug matching the
// article title. Idempotent: rows whose slug no longer matches an "old" key are
// skipped. Remove this file after the rename has run.
const KEY = 'darsni-slug-7f3q9x-2026';
const RENAMES: Record<string, string> = {
  "كول": "excel-in-laghati-saudi-curriculum-guide",
  "لبب": "unit-one-matter-study-science-method",
  "Ljgf": "living-organisms-unit-1-kingdoms-cells-classification",
  "Khh": "online-physics-tutor-understand-laws-problems",
  "Jhf": "online-chemistry-tutor-secondary",
  "البراه": "free-proof-in-mathematics-explained",
  "Nn": "primary-science-teacher-saudi-curriculum",
  "Jg": "math-monthly-exams-revision-plan",
  "نت": "online-math-tutor-saudi-curriculum",
  "تال": "slope-intercept-equation-explained",
  "Jgdd": "online-english-tutor-choose-right-teacher-child",
  "Bv": "present-simple-tense-explained-examples",
  "Hg": "best-ways-learn-english-primary-students",
  "Jhh": "present-perfect-tense-rules-examples",
  "ظنو": "english-revision-secondary-before-exams",
  "Jh": "introduction-to-calculus-basics-laws",
  "متا": "english-foundation-for-kids-from-scratch",
  "زال": "online-english-teacher-saudi-curriculum-all-levels",
  "نتا": "math-monthly-tests-revision-saudi",
  "نال": "exam-days-revision-guide-saudi-curricula",
  "Nvc": "trigonometry-explained-simply-laws",
  "متل": "unit-1-nice-to-meet-you-grade-5-summary",
  "Khg": "child-confidence-speaking-english",
  "نلب": "choose-best-online-english-teacher-for-your-child",
  "متلب": "present-continuous-tense-explained",
  "نابب": "primary-science-teacher-online-follow-up",
  "تعلي": "learn-english-online-from-zero-to-professional",
  "مقال": "online-english-lessons-all-levels",
  "حصة-تجريبية": "free-trial-lesson-online-english-teacher",
  "معلمة-انجليزب": "online-english-teachers-middle-school-saudi",
  "افضل-مع": "best-online-physics-teacher-saudi-curriculum",
  ",دروس-إنجليزي-أونلاينمعلمة-إنجليزي-في-السعودية,المنهج-السعودي-لغة-إنجليزية,معلمة-انجليزي-اون-لاين": "best-online-english-teacher-all-saudi-levels",
  "كيف-تجعل-طفلك-يحب-اللغة-الإنجليزية-ويتقنها-بأسلوب-ممتع-ومبتكر؟": "make-your-child-love-english-fun-methods",
  "معلمة": "how-to-choose-best-online-physics-teacher",
  "معلمة-فيزياء": "physics-teacher-online-saudi-arabia-full-mark",
  "دروس-رياضيات-أونلاين-بأساليب-حديثة-ومواعيد-مرنة-تناسب-جدولك": "online-math-lessons-modern-methods-flexible",
  "ية-المجانية-في-الرياضيات-وابدأ-رحلة-التميز": "free-trial-math-lesson-start-excellence",
  "كيف-تتغلب-على-الخوف-من-الرياضيات-وتتفوق-فيها-أونلاين؟": "overcome-math-anxiety-excel-online",
  "دروس-خصوصية-اون-لاين-من-بيتك": "private-lessons-online-from-home",
  "دروس-خصوصية-اون-لاين-_تعليم-اللغة-العربية-للأطفال-ابتدائي": "online-private-lessons-arabic-for-kids-primary",
  "كورس-تعلم-مهارات-اللغة-الإنجليزية-للمبتدئين": "english-skills-course-for-beginners",
  "دروس-إنجليزي-أون-لاين---مدرسون-وعن-بعد-لجميع-المستويات": "english-lessons-online-remote-teachers",
  "معلمة-لغة-عربس": "online-laghati-arabic-teacher-saudi",
  "مدرس-رياضيات-أون-لاين-–-أفضل-معلم-رياضيات-لتحقيق-التفوق-الدراسي": "best-online-math-tutor-excellence",
  "معلمة-رياضيات-أون-لاين": "online-math-teacher",
  "معلمة-فيزياء-أون-لاين-–-تعلم-الفيزياء-بسهولة-مع-أفضل-معلمة-خصوصية-عبر-الإنترنت": "online-physics-teacher-learn-easily",
  "معلمة-كيمياء-أون-لاين": "online-chemistry-teacher-best-way-top-grades",
  "مدرس-إنجليزي-أون-لاين-|-أفضل-مدرس-لغة-إنجليزية-أون-لاين-للمنهج-السعودي-والجامعات": "online-english-tutor-saudi-curriculum-universities",
  "معلمين-ومعلمات-الأونلاين-لمناهج-السعودية-والكويت-وقطر": "online-teachers-saudi-kuwait-qatar-curricula",
  "معلمة-انجليزي-أونلاين-المنهج-القطري": "online-english-teacher-qatari-curriculum",
  "تأسيس-إنجليزي-من-الصفر-|-أفضل-طريقة-لتعلم-الإنجليزية-للمبتدئين-والأطفال": "english-foundation-from-zero-beginners-kids",
  "معلمة-انجليزي-اون-لاين:-أفضل-طريقة-لتعلم-اللغة-الإنجليزية-بسهولة-واحترافية": "online-english-teacher-learn-easily-professionally",
  "كورس-انجليزي-اون-لاين-–-أفضل-طريقة-لتعلم-اللغة-الإنجليزية-من-المنزل": "online-english-course-from-home-guide"
};

export const GET: APIRoute = async ({ url }) => {
  if (url.searchParams.get('key') !== KEY) {
    return new Response('Forbidden', { status: 403 });
  }
  const db = env.DB;
  if (!db) return new Response('No DB', { status: 500 });

  if (url.searchParams.get('run') !== '1') {
    const { results } = await db.prepare('SELECT slug, title FROM blog ORDER BY created_at DESC').all();
    return Response.json({ mode: 'report', count: results?.length || 0, posts: results });
  }

  const report: any[] = [];
  for (const [oldSlug, newSlug] of Object.entries(RENAMES)) {
    const row: any = await db.prepare('SELECT id, slug FROM blog WHERE slug = ?').bind(oldSlug).first();
    if (!row) {
      report.push({ oldSlug, newSlug, status: 'not-found-or-already-renamed' });
      continue;
    }
    await db.prepare('UPDATE blog SET slug = ? WHERE id = ?').bind(newSlug, row.id).run();
    report.push({ oldSlug, newSlug, status: 'renamed' });
  }
  const renamed = report.filter(r => r.status === 'renamed').length;
  return Response.json({ mode: 'run', renamed, total: report.length, report });
};
