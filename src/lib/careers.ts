import { getCollection, type CollectionEntry } from 'astro:content';
export type Career = CollectionEntry<'careers'>['data'];
export type Scene = Career['scenes'][number];
export async function getCareers(): Promise<Career[]> {
  const entries = await getCollection('careers');
  const careers = entries.map(entry => entry.data).sort((a,b) => a.order - b.order || a.slug.localeCompare(b.slug));
  for (const entry of entries) {
    if (entry.id !== entry.data.slug) throw new Error(`ファイル名とslugを一致させてください: ${entry.id}`);
  }
  if (new Set(careers.map(c => c.slug)).size !== careers.length) throw new Error('職業のslugが重複しています');
  return careers;
}
