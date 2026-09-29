import type { APIRoute } from 'astro';
import { learningLinks, lessonUrl } from '../../lib/learning-links';
import { sitePath } from '../../lib/paths';
export const GET: APIRoute = ({ site }) => {
  if (!site) throw new Error('Astro site is required');
  return new Response(JSON.stringify(learningLinks.flatMap(field => field.lessons.map(lesson => ({
    lessonSlug: lesson.slug,
    lessonUrl: lessonUrl(lesson.slug),
    label: `${field.label}のミライシーンへ`,
    miraiUrl: new URL(sitePath(`explore/${field.id}/`), site).href,
  }))), null, 2), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
