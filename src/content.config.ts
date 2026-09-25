import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import interests from './data/interests.json';

const text = z.string().trim().min(1);
const asset = text.refine(value => /^assets\/[a-zA-Z0-9/_-]+\.(png|jpe?g|webp|svg)$/.test(value), 'public/assets 内の画像パスを指定してください')
  .refine(value => existsSync(resolve('public', value)), '画像ファイルが見つかりません');
const image = z.object({ src: asset, alt: text });
const option = z.object({ id: text, label: text, explanation: text, benefit: text, caution: text });
const uniqueIds = (values: { id: string }[]) => new Set(values.map(v => v.id)).size === values.length;
const scene = z.object({
  id: text, title: text, situation: text, question: text, contextExplanation: text,
  image: image.optional(),
  comparison: z.array(image.extend({ caption: text })).min(2).max(3).optional(),
  options: z.array(option).length(3).refine(uniqueIds, '選択肢のIDは重複できません'),
  perspective: text, insight: text,
});

const careers = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/careers' }),
  schema: z.object({
    slug: text.regex(/^[a-z][a-z0-9-]*$/), order: z.number().int().nonnegative(),
    name: text, category: text, entryTitle: text, description: text, word: text,
    color: text.regex(/^#[0-9a-f]{6}$/i), ink: text.regex(/^#[0-9a-f]{6}$/i),
    interests: z.array(text.refine(id => interests.some(item => item.id === id), '未定義の興味タグです')).min(1),
    estimatedMinutes: z.number().int().positive(),
    reviewStatus: z.enum(['editorial-draft', 'reviewed']),
    image: image.optional(), mission: text.optional(),
    brief: z.object({ role: text, audience: text, goal: text, constraint: text }).optional(),
    studies: z.array(text).min(1), learning: text,
    scenes: z.array(scene).length(3).refine(uniqueIds, 'シーンのIDは重複できません'),
  }).refine(c => Boolean(c.mission) === Boolean(c.brief), 'missionとbriefは両方を指定してください'),
});

export const collections = { careers };
