import { z } from 'astro/zod';
import data from '../data/learning-links.json';

const text = z.string().trim().min(1);
export const learningLinks = z.array(z.object({
  id: text.regex(/^[a-z][a-z0-9-]*$/), label: text, description: text,
  lessons: z.array(z.object({ slug: text.regex(/^[a-z0-9_]+$/), label: text, schoolType: z.enum(['大学・短大', '専門学校']) })).min(1),
  schoolFields: z.array(z.object({ id: text.regex(/^[A-Z]-\d+$/), label: text })).min(1),
})).refine(items => new Set(items.map(item => item.id)).size === items.length, '学びIDが重複しています').parse(data);

export function getLearningLinks(ids: string[]) {
  return ids.map(id => {
    const item = learningLinks.find(item => item.id === id);
    if (!item) throw new Error(`学びIDが未定義です: ${id}`);
    return item;
  });
}
export const lessonUrl = (slug: string) => {
  const base = import.meta.env.INQUIRY_BASE_URL;
  if (base) {
    const url = new URL(base.endsWith('/') ? base : base + '/');
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('INQUIRY_BASE_URL must be HTTP(S)');
    return new URL('forteacher/' + encodeURIComponent(slug) + '/', url).href;
  }
  return 'https://shinronavi.com/forteacher/lesson?' + new URLSearchParams({ slug });
};
export function schoolSearchUrl(ids: string[]) {
  const url = new URL('https://shinronavi.com/search/result');
  for (const id of new Set(getLearningLinks(ids).flatMap(item => item.schoolFields.map(field => field.id)))) url.searchParams.append('fld[]', id);
  if (!url.search) throw new Error('学校検索の分野が未指定です');
  return url.href;
}
