import fs from 'node:fs';
import path from 'node:path';
import { loadDraftBatch, countDraftContent } from './draftBatch.mjs';
import { digest } from './sourceSnapshot.mjs';

const reviewStages = ['occupational', 'editorial'];
const hasText = value => typeof value === 'string' && value.trim().length > 0 && !/未記入|要記入|TODO|【要/.test(value);
const matchesIds = (actual, expected) => Array.isArray(actual) && actual.length === expected.length && actual.every((id, index) => id === expected[index]);

function requireDecision(decision, target) {
  if (decision?.status !== 'pass' || !hasText(decision.reason)) throw new Error(`${target}: 確認結果と判断理由が必要です。`);
}

function verifyScene(scene, check, target) {
  const options = scene.options;
  if (!Array.isArray(options) || options.length !== 3 || new Set(options.map(option => option.id)).size !== 3 || !check || !matchesIds(check.optionIds, options.map(option => option.id))) {
    throw new Error(`${target}: 選択肢の照合範囲が一致しません。`);
  }
  for (const stage of reviewStages) requireDecision(check[stage], `${target}/${stage}`);
  // シーンの一括判定だけで個々の回答の確認漏れを通さない。
  if (!Array.isArray(check.optionChecks) || !matchesIds(check.optionChecks.map(item => item?.optionId), options.map(option => option.id))) {
    throw new Error(`${target}: 全3回答の確認記録が必要です。`);
  }
  for (const optionCheck of check.optionChecks) requireDecision(optionCheck, `${target}/${optionCheck.optionId}: 回答の成立条件と解説`);
}

function verifyManuscript(entry, check) {
  const { file, manuscript, sha256 } = entry;
  if (!check) throw new Error(`${file}: 確認記録がありません。`);
  // 記録と対象原稿の一致を確認する。内容の真偽は自動判定しない。
  if (check.sha256 !== sha256) throw new Error(`${file}: 確認対象と原稿が異なります。両観点を再確認してください。`);
  if (!Array.isArray(check.sources) || !check.sources.length || !check.sources.every(hasText)) throw new Error(`${file}: 業務の根拠資料が必要です。`);
  if (!Array.isArray(manuscript.scenes) || manuscript.scenes.length !== 3 || new Set(manuscript.scenes.map(scene => scene.id)).size !== 3 || !Array.isArray(check.scenes) || check.scenes.length !== 3 || new Set(check.scenes.map(scene => scene?.sceneId)).size !== 3) {
    throw new Error(`${file}: 全3シーンの記録が必要です。`);
  }
  for (const scene of manuscript.scenes) verifyScene(scene, check.scenes.find(item => item?.sceneId === scene.id), `${file}/${scene.id}`);
}

export function verifyEditorialReview(batchId, root = process.cwd()) {
  const batch = loadDraftBatch(batchId, root);
  const reportBytes = fs.readFileSync(path.join(batch.directory, 'review', 'occupationChecks.json'));
  const report = JSON.parse(reportBytes);
  if (report.batchId !== batchId || !Array.isArray(report.entries) || report.entries.length !== batch.entries.length) {
    throw new Error('原稿一覧と確認記録の対象件数・バッチが一致しません。');
  }
  for (const stage of reviewStages) {
    const pass = report.passes?.[stage];
    if (!hasText(pass?.reviewer) || !/^\d{4}-\d{2}-\d{2}$/.test(pass?.checkedAt ?? '') || !hasText(pass?.method)) {
      throw new Error(`${stage}: 確認者・日付・確認方法が必要です。`);
    }
  }
  const entries = new Map(report.entries.map(entry => [entry?.slug, entry]));
  if (entries.size !== batch.entries.length) throw new Error('確認記録のslugが重複しています。');
  for (const entry of batch.entries) verifyManuscript(entry, entries.get(entry.manuscript.slug));
  return { ...batch, report, reviewSha256: digest(reportBytes), counts: countDraftContent(batch.manuscripts) };
}
