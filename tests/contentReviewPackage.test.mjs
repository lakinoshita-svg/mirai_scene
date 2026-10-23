import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createReviewFixture } from './helpers/reviewFixture.mjs';
import { packageDraftContent } from '../scripts/lib/contentReviewPackage.mjs';
import { digest } from '../scripts/lib/sourceSnapshot.mjs';

test('バッチの実件数でZIPを作り、同梱ファイルをハッシュ照合する', { skip: process.platform !== 'win32' }, t => {
  const fixture = createReviewFixture(t);
  const outputDirectory = path.join(fixture.root, 'outputs/確認用');
  const result = packageDraftContent('batch-999', { root: fixture.root, outputDirectory });
  assert.equal(result.manifest.experienceCount, 1);
  assert.equal(result.manifest.sceneCount, 3);
  assert.equal(result.manifest.optionCount, 9);
  assert.equal(result.manifest.sha256, digest(fs.readFileSync(result.zipPath)));
  assert.equal(result.manifest.fileCount, result.manifest.files.length);
  assert.ok(result.manifest.files.some(file => file.path === 'README.txt' && file.sha256));
  assert.ok(result.manifest.files.some(file => file.path === 'drafts/batch-999/review/answerChecks.md'));
  assert.ok(!JSON.stringify(result.manifest).includes(fixture.root));
  const before = fs.readFileSync(result.zipPath);
  assert.throws(() => packageDraftContent('batch-999', { root: fixture.root, outputDirectory }), /上書き/);
  assert.deepEqual(fs.readFileSync(result.zipPath), before);
});

test('原稿が確認記録と異なる場合は配布先にZIPを作らない', t => {
  const fixture = createReviewFixture(t);
  const outputDirectory = path.join(fixture.root, 'outputs/確認用');
  fs.appendFileSync(fixture.manuscriptPath, '\n');
  assert.throws(() => packageDraftContent('batch-999', { root: fixture.root, outputDirectory }), /確認対象と原稿/);
  assert.equal(fs.existsSync(outputDirectory), false);
});
