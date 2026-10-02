// 原稿は読み取り専用。出力ごとのフォルダで、記入済みExcelを上書きしない。
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadReviewData } from './lib/reviewData.mjs';
import { createReviewWorkbook } from './lib/reviewWorkbook.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const data = await loadReviewData(root);
if (process.argv.includes('--check')) {
  console.log(JSON.stringify({careers: data.careers.length, contentFields: data.rows.length, configFields: data.configs.length}));
} else {
  await exportReview(data);
}

async function exportReview(data) {
  // 同梱依存を利用。別端末では環境変数で指定でき、作業用コピーやjunctionは不要。
  const moduleRoot = process.env.CODEX_ARTIFACT_MODULE_ROOT || path.join(
    os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules',
  );
  let api;
  try {
    const runtimeRequire = createRequire(path.join(moduleRoot, '__review_export__.cjs'));
    api = await import(pathToFileURL(runtimeRequire.resolve('@oai/artifact-tool')).href);
  } catch (cause) {
    throw new Error('Excel出力にはCodex同梱のartifact-toolが必要です。CODEX_ARTIFACT_MODULE_ROOTに同梱node_modulesの場所を指定してください。', {cause});
  }
  const createdAt = new Date();
  const stamp = createdAt.toISOString().replace(/[:.]/g, '-');
  const out = path.join(root, 'outputs/operations', stamp);
  const previewDir = path.join(root, 'tmp/review-export', stamp);
  await fs.mkdir(out, {recursive: true});
  await fs.mkdir(previewDir, {recursive: true});
  const {workbook, previews} = createReviewWorkbook(api.Workbook, data, createdAt);
  workbook.recalculate();
  for (const preview of previews) {
    const image = await workbook.render({sheetName: preview.name, range: preview.range, scale: 1});
    await fs.writeFile(path.join(previewDir, preview.name + '.png'), new Uint8Array(await image.arrayBuffer()));
  }
  const target = path.join(out, 'ミライシーン_原稿確認.xlsx');
  await (await api.SpreadsheetFile.exportXlsx(workbook)).save(target);
  const manifest = {
    createdAt: createdAt.toISOString(), careers: data.careers.length,
    scenes: data.careers.reduce((count, career) => count + career.scenes.length, 0),
    contentFields: data.rows.length, configFields: data.configs.length, sources: data.sources,
  };
  await fs.writeFile(path.join(out, 'ミライシーン_原稿確認.manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`確認用Excel: ${target}`);
}
