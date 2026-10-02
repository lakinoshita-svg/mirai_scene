import fs from 'node:fs';
import path from 'node:path';
// 下書きは公開コレクションの外に作る。コピーした原稿を未編集のまま公開しないため。
const [source, slug] = process.argv.slice(2);
if (!source || !slug || !/^[a-z][a-z0-9-]*$/.test(source) || !/^[a-z][a-z0-9-]*$/.test(slug)) {
  console.error('使い方: npm run content:new -- engineer new-slug'); process.exit(1);
}
const data = JSON.parse(fs.readFileSync(`src/content/careers/${source}.json`, 'utf8'));
if (fs.existsSync(`src/content/careers/${slug}.json`)) throw new Error('公開済みのslugです');
data.slug = slug;
data.name = '【要編集】職業名';
data.entryTitle = '【要編集】体験の見出し';
data.reviewStatus = 'editorial-draft';
delete data.review;
data.order = Math.max(...fs.readdirSync('src/content/careers').filter(f => f.endsWith('.json')).map(f => JSON.parse(fs.readFileSync(`src/content/careers/${f}`, 'utf8')).order)) + 1;
fs.mkdirSync('drafts', { recursive: true });
const target = path.join('drafts', `${slug}.json`);
fs.writeFileSync(target, JSON.stringify(data, null, 2) + '\n', { flag: 'wx' });
console.log(`${target} を作成しました。すべての内容・出典を確認後、src/content/careers/ に移動してください。`);
