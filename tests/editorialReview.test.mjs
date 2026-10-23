import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { verifyEditorialReview } from '../scripts/verifyEditorialReview.mjs';

import { createReviewFixture as fixture } from './helpers/reviewFixture.mjs';

test('記録と原稿が対応する場合に照合を通過する', t => {
  const { root } = fixture(t);
  assert.equal(verifyEditorialReview('batch-999', root).manuscripts.length, 1);
});
test('確認後の本文編集を検知する', t => {
  const { root, manuscriptPath } = fixture(t);
  fs.appendFileSync(manuscriptPath, '\n');
  assert.throws(() => verifyEditorialReview('batch-999', root), /確認対象と原稿/);
});
test('二巡目の未確認と、シーンの記録漏れを拒否する', t => {
  const f = fixture(t);
  f.report.entries[0].scenes[1].editorial.status = 'pending';
  f.writeReport();
  assert.throws(() => verifyEditorialReview('batch-999', f.root), /editorial/);
  f.report.entries[0].scenes.pop();
  f.writeReport();
  assert.throws(() => verifyEditorialReview('batch-999', f.root), /全3シーン/);
});
test('確認記録がない追加原稿を拒否する', t => {
  const f = fixture(t);
  fs.writeFileSync(path.join(path.dirname(f.manuscriptPath), 'another.json'), JSON.stringify({ ...f.manuscript, slug: 'another' }));
  assert.throws(() => verifyEditorialReview('batch-999', f.root), /対象件数/);
});
test('想定外のパスをバッチ指定に使わせない', () => {
  assert.throws(() => verifyEditorialReview('../batch-999'), /batch-NNN/);
});
test('回答別の記録不足・対象違い・未解決判定・根拠不足を拒否する', t => {
  const f = fixture(t);
  const scene = f.report.entries[0].scenes[0];
  const saved = structuredClone(scene.optionChecks);
  scene.optionChecks.pop();
  f.writeReport();
  assert.throws(() => verifyEditorialReview('batch-999', f.root), /全3回答/);
  scene.optionChecks = structuredClone(saved);
  scene.optionChecks[1].optionId = 'option-1';
  f.writeReport();
  assert.throws(() => verifyEditorialReview('batch-999', f.root), /全3回答/);
  scene.optionChecks = structuredClone(saved);
  scene.optionChecks[1].status = 'pending';
  f.writeReport();
  assert.throws(() => verifyEditorialReview('batch-999', f.root), /回答の成立条件/);
  scene.optionChecks = structuredClone(saved);
  scene.optionChecks[1].reason = '';
  f.writeReport();
  assert.throws(() => verifyEditorialReview('batch-999', f.root), /回答の成立条件/);
});
