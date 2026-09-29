import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const fields = read('src/data/learning-links.json');
const careers = fs.readdirSync(path.join(root, 'src/content/careers')).filter(f => f.endsWith('.json')).map(f => read(`src/content/careers/${f}`));
const lessons = ['university', 'vocational'].flatMap(type => read(`integrations/inquiry/src/forteacher/data/${type}.json`));
const links = {};
for (const field of fields) for (const lesson of field.lessons) {
  if (!lessons.some(item => item.slug === lesson.slug)) throw new Error(`探究側に存在しないslug: ${lesson.slug}`);
  const connection = links[lesson.slug] ??= { fields: [], careers: [] };
  connection.fields.push({ id: field.id, label: field.label });
  for (const career of careers.filter(career => career.learningIds.includes(field.id))) {
    if (!connection.careers.some(item => item.slug === career.slug)) connection.careers.push({ slug: career.slug, name: career.name, title: career.entryTitle });
  }
}
fs.writeFileSync(path.join(root, 'integrations/inquiry/src/forteacher/data/mirai-links.json'), JSON.stringify(links, null, 2) + '\n');
console.log(`${Object.keys(links).length}教材の連携データを生成しました。`);
