import fs from 'node:fs';
import path from 'node:path';
const directory = 'src/content/careers';
const themes = JSON.parse(fs.readFileSync('src/data/interests.json', 'utf8'));
const learning = JSON.parse(fs.readFileSync('src/data/learningLinks.json', 'utf8'));
const ads = JSON.parse(fs.readFileSync('src/data/schoolAds.json', 'utf8'));
const seen = new Set();
let errors = 0;
const rows = [];
for (const file of fs.readdirSync(directory).filter(file => file.endsWith('.json'))) {
  try {
    const c = JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8'));
    const fail = message => { console.error(`${file}: ${message}`); errors++; };
    if (seen.has(c.slug)) fail('slugが重複しています');
    seen.add(c.slug);
    if (file !== `${c.slug}.json`) fail('ファイル名とslugが一致していません');
    if (!themes.some(theme => theme.id === c.cardTheme)) fail('カードテーマが未定義です');
    if (!c.learningIds?.length || c.learningIds.some(id => !learning.some(field => field.id === id))) fail('学びIDが未定義です');
    if (!(c.category in ads.categoryAds)) fail('広告のカテゴリー定義がありません（広告なしの場合も空配列で登録）');
    if (c.scenes?.length !== 3) fail('シーンは3件必要です');
    // 同じ職業名で複数体験を作ることは許可する。URLのslugだけを一意にする。
    rows.push({ slug: c.slug, name: c.name, category: c.category, theme: c.cardTheme, order: c.order, review: c.reviewStatus, referenceDate: c.reference?.checkedAt });
  } catch (error) { console.error(`${file}: ${error.message}`); errors++; }
}
console.table(rows.sort((a,b) => a.order - b.order));
console.log(`${rows.length}件 / エラー${errors}件。必須項目の完全な検証は npm run build で行います。`);
process.exitCode = errors ? 1 : 0;
