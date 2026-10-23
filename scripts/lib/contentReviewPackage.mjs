import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { exportDraftDocuments } from './draftReviewDocuments.mjs';
import { assertBatchId } from './draftBatch.mjs';
import { digest } from './sourceSnapshot.mjs';

function renderPackageReadme(batch) {
  const { batchId, counts } = batch;
  const prefix = `drafts/${batchId}`;
  return `ミライシーン：追加コンテンツ${counts.experiences}件

種類：原稿・確認資料の受け渡し用
対象：${batchId}／${counts.experiences}体験・${counts.scenes}シーン・${counts.options}選択肢

■ 閲覧する
ZIPを展開し、${prefix}/manuscript.html をブラウザで開いてください。
回答ごとの成立条件・確認理由は ${prefix}/review/answerChecks.md にあります。
出典と確認範囲は ${prefix}/REVIEW.md にあります。
自社資料の原文は docs/editorial/company-career-material.txt にあります。

■ 制作元へ取り込む
編集元は ${prefix}/ 直下の${counts.experiences}個の職業JSONです。
review/occupationChecks.json は確認記録です。
同名原稿がある場合は内容を照合してください。
npmコマンドはミライシーンのリポジトリ一式がある環境で実行します。

■ 進路ナビへ掲載する
このZIPは原稿と確認資料のセットです。
掲載原稿の決定後に制作元でビルドし、配置済み版のbuildManifest.jsonと照合して導入用ZIPを作成します。
確認者・確認方法・未確認事項は同梱の確認記録を参照してください。
`;
}

export function packageDraftContent(batchId, { root = process.cwd(), outputDirectory } = {}) {
  assertBatchId(batchId);
  const now = new Date();
  const stamp = now.toISOString().replace(/[:.]/g, '-');
  const destination = path.resolve(outputDirectory ?? path.join(root, 'outputs/contentReview', batchId, stamp));
  if (fs.existsSync(destination)) throw new Error('同名の出力先は上書きできません。別の出力先を指定してください。');

  const batch = exportDraftDocuments(batchId, root);
  fs.mkdirSync(path.join(root, 'tmp'), { recursive: true });
  const staging = fs.mkdtempSync(path.join(root, 'tmp/contentReview-'));
  const packageDirectory = path.join(staging, 'package');
  fs.mkdirSync(packageDirectory);
  const readmePath = path.join(staging, 'README.txt');
  fs.writeFileSync(readmePath, renderPackageReadme(batch));

  // 同梱対象を明示し、一時ファイルや別バッチの原稿を混ぜない。
  const prefix = `drafts/${batchId}`;
  const relativeFiles = [
    ...batch.entries.map(entry => `${prefix}/${entry.file}`),
    ...['README.md', 'REVIEW.md', 'review/occupationChecks.json', ...batch.documents].map(file => `${prefix}/${file}`),
    'docs/editorial/company-career-material.txt',
  ];
  const files = relativeFiles.map(relativePath => {
    const sourcePath = path.join(root, relativePath);
    return { path: relativePath, sourcePath, sha256: digest(fs.readFileSync(sourcePath)), bytes: fs.statSync(sourcePath).size };
  });
  const expectedSources = new Map(batch.entries.map(entry => [`${prefix}/${entry.file}`, entry.sha256]));
  expectedSources.set(`${prefix}/review/occupationChecks.json`, batch.reviewSha256);
  for (const file of files) {
    if (expectedSources.has(file.path) && expectedSources.get(file.path) !== file.sha256) {
      throw new Error(`${file.path}: 照合中に原稿または確認記録が変わりました。再実行してください。`);
    }
  }
  files.push({ path: 'README.txt', sourcePath: readmePath, sha256: digest(fs.readFileSync(readmePath)), bytes: fs.statSync(readmePath).size });

  const zipName = `miraiSceneContents${batchId.replace(/^batch-/, 'Batch')}.zip`;
  const zipPath = path.join(packageDirectory, zipName);
  const planPath = path.join(staging, 'archivePlan.json');
  fs.writeFileSync(planPath, JSON.stringify({ zipPath, files }, null, 2));
  const archiveScript = fileURLToPath(new URL('./contentReviewArchive.ps1', import.meta.url));
  // PowerShell側はZIP入出力だけを担当。日本語の本文はUTF-8の計画ファイルで渡す。
  const result = spawnSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', archiveScript, '-Plan', planPath], { encoding: 'utf8', windowsHide: true });
  if (result.error || result.status !== 0) throw new Error(`確認用ZIPの作成・照合に失敗しました: ${result.error?.message || result.stderr || result.stdout}`);

  const manifest = {
    packageType: 'reviewedContentSources', batchId, createdAt: now.toISOString(), zip: zipName,
    sha256: digest(fs.readFileSync(zipPath)), bytes: fs.statSync(zipPath).size, fileCount: files.length,
    experienceCount: batch.counts.experiences, sceneCount: batch.counts.scenes, optionCount: batch.counts.options,
    files: files.map(({ sourcePath, ...file }) => file),
  };
  fs.writeFileSync(path.join(packageDirectory, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  // ZIPと照合表がそろった出力だけを配布先へ出す。既存の配布物は上書きしない。
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  if (fs.existsSync(destination)) throw new Error('出力先が存在します。配布物は上書きできません。');
  fs.renameSync(packageDirectory, destination);
  return { directory: destination, zipPath: path.join(destination, zipName), manifest };
}
