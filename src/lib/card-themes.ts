import { z } from 'astro/zod';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import definitions from '../data/interests.json';

// One registry drives filters, artwork and validation, without a fixed theme count.
export const cardThemes = z.array(z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]*$/),
  label: z.string().trim().min(1),
  image: z.string().regex(/^assets\/[a-zA-Z0-9/_-]+\.(svg|png|webp|jpe?g)$/)
    .refine(src => existsSync(resolve('public', src)), 'テーマ画像が見つかりません'),
  color: z.string().regex(/^#[0-9a-f]{6}$/i),
  ink: z.string().regex(/^#[0-9a-f]{6}$/i),
})).refine(items => new Set(items.map(item => item.id)).size === items.length, 'テーマIDが重複しています').parse(definitions);

export function getCardTheme(id: string) {
  const theme = cardThemes.find(theme => theme.id === id);
  if (!theme) throw new Error(`未定義のカードテーマ: ${id}`);
  return theme;
}
