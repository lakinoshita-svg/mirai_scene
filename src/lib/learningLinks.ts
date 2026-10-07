import { z } from 'astro/zod';
import data from '../data/learningLinks.json';

// 編集元は learningLinks.json。表示テーマ・広告カテゴリーとは別に、学びのIDで連携する。
// 職業JSONのlearningIdsと対応させる。JSONはコメントを持てないため、編集手順は LEARNING-LINKS.md を参照。
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
// 未設定：進路ナビ本番のクエリ形式。設定あり：独立した教材Astroの静的パス形式。
// INQUIRY_BASE_URLはビルド／dev起動時に読む。利用者のアクセス先から自動判定しない。
export const lessonUrl = (slug: string) => {
  const base = import.meta.env.INQUIRY_BASE_URL;
  if (base) {
    const url = new URL(base.endsWith('/') ? base : base + '/');
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('INQUIRY_BASE_URL must be HTTP(S)');
    return new URL('forteacher/' + encodeURIComponent(slug) + '/', url).href;
  }
  return 'https://shinronavi.com/forteacher/lesson?' + new URLSearchParams({ slug });
};
// fld[]は進路ナビ側の検索仕様。同じ分野を重複送信しないようにまとめ、カンマ区切りにはしない。
// 分野IDは外部サービスの値なので、変更時は実際の検索結果で選択条件が保持されるか確認する。
export function schoolSearchUrl(ids: string[]) {
  const url = new URL('https://shinronavi.com/search/result');
  for (const id of new Set(getLearningLinks(ids).flatMap(item => item.schoolFields.map(field => field.id)))) url.searchParams.append('fld[]', id);
  if (!url.search) throw new Error('学校検索の分野が未指定です');
  return url.href;
}
