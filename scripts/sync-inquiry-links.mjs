import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createLessonConnections } from '../src/lib/lesson-connections.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
// このスクリプトが探究側へ書き出すJSONは生成物。直接編集すると次回同期で上書きされる。
// 編集元：learning-links.json と careers/*.json。更新後は npm run sync:inquiry → 探究側ビルド。
const fields = read('src/data/learning-links.json');
const careers = fs.readdirSync(path.join(root, 'src/content/careers')).filter(f => f.endsWith('.json')).map(f => read(`src/content/careers/${f}`));
const lessons = ['university', 'vocational'].flatMap(type => read(`integrations/inquiry/src/forteacher/data/${type}.json`));
const links = createLessonConnections(fields, careers);
const availableLessons = new Set(lessons.map(lesson => lesson.slug));
// 書き出す前に全slugを検証する。教材名の変更・削除で壊れたリンクを配布しないため。
for (const slug of Object.keys(links)) {
  if (!availableLessons.has(slug)) throw new Error(`探究側に存在しないslug: ${slug}`);
}
fs.writeFileSync(path.join(root, 'integrations/inquiry/src/forteacher/data/mirai-links.json'), JSON.stringify(links, null, 2) + '\n');
console.log(`${Object.keys(links).length}教材の連携データを生成しました。`);
