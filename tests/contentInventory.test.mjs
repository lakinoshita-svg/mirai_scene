import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createReviewFixture } from './helpers/reviewFixture.mjs';
import { collectContentInventory, renderContentInventory } from '../scripts/lib/contentInventory.mjs';
import { exportDraftDocuments } from '../scripts/lib/draftReviewDocuments.mjs';

function fixture(t) {
  const f = createReviewFixture(t);
  const write = (file, value) => {
    const target = path.join(f.root, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, JSON.stringify(value));
  };
  write('config/contentOperations.json', { contents: {}, ads: {} });
  write('config/publicationApprovals.json', {});
  write('config/preview.json', { batches: ['batch-999'] });
  write('src/data/schoolAds.json', { ads: [] });
  write('src/content/careers/published.json', { ...f.manuscript, slug: 'published', order: 1 });
  f.manuscript.order = 2;
  f.writeManuscript();
  fs.writeFileSync(path.join(f.directory, 'README.md'), '# 確認原稿');
  fs.writeFileSync(path.join(f.directory, 'REVIEW.md'), '# 出典・確認記録\n出典は本書に記載。');
  exportDraftDocuments('batch-999', f.root);
  return { ...f, write, collect: () => collectContentInventory(f.root, '2026-11-10') };
}

test('同職種の題材数と種類数、公開元・下書き・プレビュー設定を分ける', t => {
  const f = fixture(t);
  const inventory = f.collect();
  assert.deepEqual(inventory.summary, { experiences: 2, occupations: 1, categories: 1, published: 1, drafts: 1, preview: 2, files: 2 });
  assert.equal(inventory.occupations[0].experiences, 2);
  assert.equal(inventory.issues.length, 0);
  assert.equal(fs.existsSync(path.join(f.root, 'outputs')), false, '読み込みでは生成しない');
  assert.ok(inventory.rows.every(row => row.publication === '承認記録なし'));
});

test('昇格時の重複コピーを二体験と数えず、プレビュー衝突を明示する', t => {
  const f = fixture(t);
  fs.copyFileSync(f.manuscriptPath, path.join(f.root, 'src/content/careers', f.manuscript.slug + '.json'));
  const inventory = f.collect();
  assert.equal(inventory.summary.experiences, 2);
  assert.equal(inventory.summary.files, 3);
  assert.equal(inventory.summary.preview, null);
  assert.ok(inventory.issues.some(issue => issue.target === f.manuscript.slug && /複数箇所/.test(issue.message)));
});

test('統合記録の欠落・原稿との不一致を承認へ読み替えない', t => {
  const f = fixture(t);
  fs.appendFileSync(f.manuscriptPath, '\n');
  assert.equal(f.collect().batches[0].recordStatus, '要確認');
  fs.unlinkSync(path.join(f.directory, 'review/occupationChecks.json'));
  const inventory = f.collect();
  assert.equal(inventory.batches[0].recordStatus, '記録なし');
  assert.equal(inventory.summary.experiences, 2);
  assert.ok(inventory.issues.some(issue => /確認済みとは扱いません/.test(issue.message)));
});

test('配布用資料の欠落・内容不一致と、実際に参照される出典ファイルを検出する', t => {
  const f = fixture(t);
  fs.appendFileSync(path.join(f.directory, 'manuscript.html'), '不一致');
  fs.unlinkSync(path.join(f.directory, 'review/answerChecks.md'));
  fs.appendFileSync(path.join(f.directory, 'README.md'), '\n[出典](review/sourceEvidence.md)');
  const inventory = f.collect();
  assert.equal(inventory.batches[0].recordStatus, '原稿と一致');
  assert.deepEqual(inventory.batches[0].missingDocuments, ['review/answerChecks.md', 'review/sourceEvidence.md']);
  assert.ok(inventory.issues.some(issue => issue.target.endsWith('manuscript.html')));
});

test('対象不明・重複・空のプレビュー設定を件数として表示しない', t => {
  const f = fixture(t);
  for (const batches of [['batch-998'], ['batch-999', 'batch-999'], []]) {
    f.write('config/preview.json', { batches });
    const inventory = f.collect();
    assert.equal(inventory.summary.preview, null);
    assert.ok(inventory.issues.some(issue => issue.target === 'config/preview.json'));
  }
});

test('掲載順の重複を明示し、表示用の原稿文字をHTMLとして実行させない', t => {
  const f = fixture(t);
  f.manuscript.order = 1;
  f.manuscript.entryTitle = '<script>alert(1)</script>';
  f.writeManuscript();
  const inventory = f.collect();
  assert.ok(inventory.issues.some(issue => issue.target === 'order=1'));
  const html = renderContentInventory(inventory);
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(!html.includes('<script>'));
});
