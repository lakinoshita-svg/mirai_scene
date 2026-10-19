import fs from 'node:fs';
import path from 'node:path';

// 原稿と配布設定を正本にし、指定したプロジェクト内で生成を完結させる。
export function buildOperationsManual(root) {
  const readJson = relative => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
  const delivery = readJson('config/delivery.json');
  const careers = fs.readdirSync(path.join(root, 'src/content/careers'))
    .filter(file => file.endsWith('.json'))
    .map(file => readJson(`src/content/careers/${file}`));
  const values = {
    contentCount: careers.length,
    sceneCount: careers.reduce((sum, career) => sum + career.scenes.length, 0),
    releasePath: `deliveries/${delivery.release}/${delivery.zip}`,
    date: delivery.date,
  };
  const template = fs.readFileSync(path.join(root, 'docs/operationsManual.html'), 'utf8');
  const html = template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (!Object.hasOwn(values, key)) throw new Error(`マニュアルの未定義項目: ${key}`);
    return String(values[key]);
  });
  const outputPath = path.join(root, 'outputs/operations/運用マニュアル.html');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, html);
  return { outputPath, ...values };
}
