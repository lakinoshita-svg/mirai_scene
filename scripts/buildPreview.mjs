import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { loadDraftBatch } from './lib/draftBatch.mjs';

// 確認サイトだけに下書きを含める。公開原稿・導入ビルド・固定ZIPは編集しない。
// 対象を明示し、次に制作するバッチを意図せずGitHubへ掲載しない。
const root = process.cwd();
const { batches } = JSON.parse(fs.readFileSync('config/preview.json', 'utf8'));
if (!Array.isArray(batches) || !batches.length || new Set(batches).size !== batches.length) {
  throw new Error('プレビュー対象のバッチを重複なく指定してください。');
}
const entries = batches.flatMap(batch => loadDraftBatch(batch, root).entries);
fs.mkdirSync('tmp', { recursive: true });
const target = fs.mkdtempSync(path.join(root, 'tmp', 'site-preview-'));
fs.cpSync('src', path.join(target, 'src'), { recursive: true });
for (const file of ['astro.config.mjs', 'package.json', 'tsconfig.json']) {
  fs.copyFileSync(file, path.join(target, file));
}
fs.symlinkSync(path.join(root, 'public'), path.join(target, 'public'), 'junction');
const directory = path.join(target, 'src/content/careers');
const expectedCount = fs.readdirSync(directory).filter(file => file.endsWith('.json')).length + entries.length;
for (const { file, sourcePath } of entries) {
  // 同名の公開原稿や他バッチを上書きせず、衝突時は停止する。
  fs.copyFileSync(sourcePath, path.join(directory, file), fs.constants.COPYFILE_EXCL);
}
for (const script of ['scripts/contentAudit.mjs', 'node_modules/astro/bin/astro.mjs']) {
  const args = [path.join(root, script), ...(script.endsWith('astro.mjs') ? ['build'] : [])];
  const result = spawnSync(process.execPath, args, {
    cwd: target, stdio: 'inherit', env: { ...process.env, MIRAI_PREVIEW: 'true' },
  });
  if (result.status !== 0) process.exit(result.status || 1);
}
const output = path.join(target, 'dist');
const catalog = JSON.parse(fs.readFileSync(path.join(output, 'catalog/index.json'), 'utf8'));
if (catalog.length !== expectedCount) throw new Error('プレビュー一覧の件数が一致しません。');
for (const { manuscript } of entries) {
  if (!fs.existsSync(path.join(output, 'careers', manuscript.slug, 'index.html'))) {
    throw new Error(`${manuscript.slug}: 体験ページがありません。`);
  }
}
// Gitへ配置する前に、この出力で表示・リンクを確認する。
// 通常のdistと分離し、publish.ps1が意図せず下書きを扱わないようにする。
fs.writeFileSync(path.join(root, 'tmp/previewBuild.json'), JSON.stringify({
  output, target, count: catalog.length, draftCount: entries.length, batches,
}, null, 2));
console.log(`プレビュー ${catalog.length}件（下書き${entries.length}件）: ${output}`);
