import fs from 'node:fs';
import path from 'node:path';
import { digest } from './sourceSnapshot.mjs';

export function assertBatchId(batchId) {
  if (!/^batch-\d+$/.test(batchId ?? '')) throw new Error('batch-NNNを指定してください。');
  return batchId;
}

// 原稿直下のJSONだけを読み、review配下の記録を職業原稿に混ぜない。
export function loadDraftBatch(batchId, root = process.cwd()) {
  assertBatchId(batchId);
  const directory = path.join(root, 'drafts', batchId);
  const entries = fs.readdirSync(directory).filter(file => file.endsWith('.json')).sort().map(file => {
    const sourcePath = path.join(directory, file);
    const bytes = fs.readFileSync(sourcePath);
    const manuscript = JSON.parse(bytes);
    if (file !== `${manuscript.slug}.json`) throw new Error(`${file}: ファイル名とslugが一致しません。`);
    return { file, sourcePath, manuscript, sha256: digest(bytes) };
  });
  if (!entries.length) throw new Error('確認対象の原稿がありません。');
  entries.sort((a, b) => a.manuscript.order - b.manuscript.order || a.manuscript.slug.localeCompare(b.manuscript.slug));
  return { batchId, directory, entries, manuscripts: entries.map(entry => entry.manuscript) };
}

export function countDraftContent(manuscripts) {
  return {
    experiences: manuscripts.length,
    scenes: manuscripts.reduce((count, manuscript) => count + manuscript.scenes.length, 0),
    options: manuscripts.reduce((count, manuscript) => count + manuscript.scenes.reduce((sum, scene) => sum + scene.options.length, 0), 0),
  };
}
