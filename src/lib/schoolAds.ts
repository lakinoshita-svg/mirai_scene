import { z } from 'astro/zod';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import rawConfig from '../data/schoolAds.json';
import regions from '../data/adRegions.json';
import { getCategoryAds, selectSchoolAds } from './selectSchoolAds.mjs';
const text = z.string().trim().min(1);
const schema = z.object({
    ads: z.array(z.object({
        id: text,
        enabled: z.boolean(),
        targetRegions: z.array(text.refine(id => id === 'all' || regions.some(region => region.id === id), '未定義の広告地域です'))
            .min(1).refine(ids => new Set(ids).size === ids.length, '広告地域が重複しています')
            .refine(ids => !ids.includes('all') || ids.length === 1, '全国指定はallのみを指定してください'),
        schoolName: text,
        schoolType: z.enum(['大学', '専門学校']),
        title: text,
        description: text,
        url: z.url({ protocol: /^https$/ }),
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
        for (const id of entries)
            if (!ids.has(id))
                ctx.addIssue({ code: 'custom', path: ['categoryAds', category], message: `未定義の広告ID: ${id}` });
    }
});
export const schoolAdConfig = schema.parse(rawConfig);
export type SchoolAdConfig = z.infer<typeof schema>;
export function getCategorySchoolAds(category: string) {
    return getCategoryAds(category, schoolAdConfig);
}
// Names, scene IDs and answers do not affect advertising placement.
export function getSchoolAds(category: string, config: SchoolAdConfig = schoolAdConfig, region?: string) {
    return selectSchoolAds(category, config, region);
}
