import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

// 公開スキーマを複製せず、実際のAstroビルドで下書きを検証する。
// 一時コピーでのみ公開原稿と合流させ、通常のdistや固定納品物は更新しない。
const [batch] = process.argv.slice(2);
if (!batch || !/^batch-\d+$/.test(batch)) throw new Error('使い方: npm run content:verify-drafts -- batch-001');
const root = process.cwd();
const source = path.join(root, 'drafts', batch);
const files = fs.readdirSync(source).filter(file => file.endsWith('.json'));
if (!files.length) throw new Error('検証するJSONがありません');
fs.mkdirSync('tmp', { recursive: true });
const target = fs.mkdtempSync(path.join(root, 'tmp', 'draft-preview-'));
fs.cpSync('src', path.join(target, 'src'), { recursive: true });
for (const file of ['astro.config.mjs', 'package.json', 'tsconfig.json']) fs.copyFileSync(file, path.join(target, file));
fs.symlinkSync(path.join(root, 'public'), path.join(target, 'public'), 'junction');
const directory = path.join(target, 'src/content/careers');
for (const file of files) {
  // 名前が衝突する下書きで既存原稿を置き換えない。別体験は別slugで登録する。
  fs.copyFileSync(path.join(source, file), path.join(directory, file), fs.constants.COPYFILE_EXCL);
}
const result = spawnSync(process.execPath, [path.join(root, 'node_modules/astro/bin/astro.mjs'), 'build'], { cwd: target, encoding: 'utf8' });
fs.writeFileSync(path.join(target, 'build.log'), (result.stdout || '') + (result.stderr || ''));
if (result.status !== 0) throw new Error(`下書きビルド失敗: ${target}/build.log`);
console.log(`${batch}: ${files.length}件の下書きを既存原稿と合わせてビルドしました。\n一時プロジェクト: ${target}\n内容承認・本番公開はしていません。`);
