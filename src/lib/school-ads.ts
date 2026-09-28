import { z } from 'astro/zod';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import rawConfig from '../data/school-ads.json';
import { selectSchoolAds } from './select-school-ads.mjs';

const text = z.string().trim().min(1);
const schema = z.object({
  ads: z.array(z.object({
    id: text,
    enabled: z.boolean(),
    schoolName: text,
    schoolType: z.enum(['大学', '専門学校']),
    title: text,
    description: text,
    url: z.string().url().refine(url => new URL(url).protocol === 'https:', '広告URLはhttpsで指定してください'),
    image: z.object({
      src: text.regex(/^assets\/[a-zA-Z0-9/_-]+\.(png|jpe?g|webp|svg)$/)
        .refine(src => existsSync(resolve('public', src)), '広告画像が見つかりません'),
      alt: text,
    }).optional(),
  })).refine(ads => new Set(ads.map(ad => ad.id)).size === ads.length, '広告IDが重複しています'),
  categoryAds: z.record(text, z.array(text).refine(ids => new Set(ids).size === ids.length, '同じ広告IDが重複しています')),
}).superRefine((config, ctx) => {
  const ids = new Set(config.ads.map(ad => ad.id));
  for (const [category, entries] of Object.entries(config.categoryAds)) {
    for (const id of entries) if (!ids.has(id)) ctx.addIssue({code:'custom', path:['categoryAds', category], message:`未定義の広告ID: ${id}`});
  }
});

export const schoolAdConfig = schema.parse(rawConfig);
export type SchoolAdConfig = z.infer<typeof schema>;

// Category alone determines placement; career names, scene IDs and answers do not.
export function getSchoolAds(category: string, config: SchoolAdConfig = schoolAdConfig) {
  return selectSchoolAds(category, config);
}
