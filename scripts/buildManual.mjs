import fs from 'node:fs';

// 件数と配布名は原稿・配布設定を正本にし、手順書へ手入力しない。
const delivery = JSON.parse(fs.readFileSync('config/delivery.json', 'utf8'));
const careers = fs.readdirSync('src/content/careers').filter(file => file.endsWith('.json'))
  .map(file => JSON.parse(fs.readFileSync(`src/content/careers/${file}`, 'utf8')));
const values = {
  contentCount: careers.length,
  sceneCount: careers.reduce((sum, career) => sum + career.scenes.length, 0),
  releasePath: `deliveries/${delivery.release}/${delivery.zip}`,
  date: delivery.date,
};
const template = fs.readFileSync('docs/operationsManual.html', 'utf8');
const html = template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
  if (!(key in values)) throw new Error(`マニュアルの未定義項目: ${key}`);
  return String(values[key]);
});
fs.mkdirSync('outputs/operations', { recursive: true });
fs.writeFileSync('outputs/operations/運用マニュアル.html', html);
console.log(`運用マニュアル: ${values.contentCount}体験・${values.sceneCount}シーン`);
