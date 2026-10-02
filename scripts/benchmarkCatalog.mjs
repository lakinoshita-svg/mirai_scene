import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
// 本番原稿を変更せず、一時プロジェクト内で300件に増やして実ビルドする。
const root = process.cwd();
fs.mkdirSync('tmp', { recursive: true });
const target = fs.mkdtempSync(path.join(root, 'tmp', 'catalog-300-'));
fs.cpSync('src', path.join(target, 'src'), { recursive: true });
for (const file of ['astro.config.mjs', 'package.json', 'tsconfig.json']) fs.copyFileSync(file, path.join(target, file));
fs.symlinkSync(path.join(root, 'public'), path.join(target, 'public'), 'junction');
const directory = path.join(target, 'src/content/careers');
const files = fs.readdirSync(directory).filter(file => file.endsWith('.json'));
const seed = JSON.parse(fs.readFileSync(path.join(directory, 'engineer.json'), 'utf8'));
for (let i = files.length; i < 300; i++) {
  const career = { ...seed, slug: `benchmark-${i}`, name: `検証用の職業${i}`, order: i };
  fs.writeFileSync(path.join(directory, `${career.slug}.json`), JSON.stringify(career));
}
const start = performance.now();
const result = spawnSync(process.execPath, [path.join(root, 'node_modules/astro/bin/astro.mjs'), 'build'], { cwd: target, encoding: 'utf8' });
fs.writeFileSync(path.join(target, 'build.log'), (result.stdout || '') + (result.stderr || ''));
if (result.status !== 0) { console.error(`ビルド失敗: ${target}/build.log`); process.exit(1); }
const html = fs.readFileSync(path.join(target, 'dist/index.html'), 'utf8');
const index = JSON.parse(fs.readFileSync(path.join(target, 'dist/catalog/index.json'), 'utf8'));
if (index.length !== 300 || (html.match(/data-career=/g)||[]).length !== 9) throw new Error('300件の索引または初期表示件数が不正です');
console.log(JSON.stringify({ count: index.length, seconds: Number(((performance.now()-start)/1000).toFixed(2)), initialCards: 9, indexBytes: fs.statSync(path.join(target, 'dist/catalog/index.json')).size, output: target }, null, 2));
