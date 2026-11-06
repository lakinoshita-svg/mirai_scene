import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createReviewFixture } from './helpers/reviewFixture.mjs';
import { packageDraftContent } from '../scripts/lib/contentReviewPackage.mjs';
import { digest } from '../scripts/lib/sourceSnapshot.mjs';

test('バッチの実件数でZIPを作り、同梱ファイルをハッシュ照合する', { skip: process.platform !== 'win32' }, t => {
  const fixture = createReviewFixture(t);
  const imageDirectory = path.join(fixture.root, 'public/assets/scenes');
  fs.mkdirSync(imageDirectory, {recursive:true});
  fs.writeFileSync(path.join(imageDirectory, 'example.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>');
  fixture.manuscript.scenes[0].comparison = [1,2].map(index => ({src:'assets/scenes/example.svg', alt:'比較画像', caption:`案${index}`}));
  fixture.writeManuscript();
  fs.writeFileSync(path.join(fixture.root, 'drafts/batch-999/review/sourceEvidence.md'), '# 根拠資料\n本文確認の範囲');
  fs.writeFileSync(path.join(fixture.root, 'drafts/batch-999/review/displayChecks.json'), JSON.stringify({ batchId: 'batch-999' }));
  fs.writeFileSync(path.join(fixture.root, 'docs/editorial/source-mapping.md'), '# 自社資料の対応');
  const outputDirectory = path.join(fixture.root, 'outputs/確認用');
  const result = packageDraftContent('batch-999', { root: fixture.root, outputDirectory });
  assert.equal(result.manifest.experienceCount, 1);
  assert.equal(result.manifest.sceneCount, 3);
  assert.equal(result.manifest.optionCount, 9);
  assert.equal(result.manifest.sha256, digest(fs.readFileSync(result.zipPath)));
  assert.equal(result.manifest.fileCount, result.manifest.files.length);
  assert.ok(result.manifest.files.some(file => file.path === 'README.txt' && file.sha256));
  assert.ok(result.manifest.files.some(file => file.path === 'drafts/batch-999/review/answerChecks.md'));
  for (const name of ['sourceEvidence.md', 'displayChecks.json', 'occupationChecks.json', 'occupationChecks.md', 'answerChecks.md']) {
    const relativePath = `drafts/batch-999/review/${name}`;
    assert.equal(result.manifest.files.filter(file => file.path === relativePath).length, 1);
    assert.equal(result.manifest.files.find(file => file.path === relativePath).sha256, digest(fs.readFileSync(path.join(fixture.root, relativePath))));
  }
  assert.ok(result.manifest.files.some(file => file.path === 'docs/editorial/source-mapping.md'));
  assert.equal(result.manifest.files.filter(file => file.path === 'public/assets/scenes/example.svg').length, 1);
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
