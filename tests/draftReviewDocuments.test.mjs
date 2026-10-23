import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'parse5';
import { createReviewFixture } from './helpers/reviewFixture.mjs';
import { exportDraftDocuments } from '../scripts/lib/draftReviewDocuments.mjs';

function descendants(node) {
  return [node, ...(node.childNodes || []).flatMap(descendants)];
}

test('HTML・回答表・職種確認表を同じ原稿と確認記録から生成する', t => {
  const fixture = createReviewFixture(t);
  const result = exportDraftDocuments('batch-999', fixture.root);
  assert.deepEqual(result.counts, { experiences: 1, scenes: 3, options: 9 });
  const html = fs.readFileSync(path.join(fixture.directory, 'manuscript.html'), 'utf8');
  const nodes = descendants(parse(html));
  assert.equal(nodes.filter(node => node.tagName === 'article').length, 1);
  assert.equal(nodes.filter(node => node.tagName === 'section').length, 3);
  assert.equal(nodes.filter(node => node.attrs?.some(attr => attr.name === 'class' && attr.value === 'option')).length, 9);
  // mission/briefは公開スキーマでも任意。省略時にundefinedを表示しない。
  assert.ok(!html.includes('undefined'));
  const answers = fs.readFileSync(path.join(fixture.directory, 'review/answerChecks.md'), 'utf8');
  assert.equal((answers.match(/^\| option-/gm) || []).length, 9);
  assert.ok(answers.includes(fixture.report.entries[0].scenes[0].optionChecks[0].reason));
  assert.ok(fs.existsSync(path.join(fixture.directory, 'review/occupationChecks.md')));
});

test('原稿のHTML記号を文字として表示し、Markdownの表を崩さない', t => {
  const fixture = createReviewFixture(t);
  fixture.manuscript.entryTitle = '<script>bad()</script>';
  fixture.manuscript.scenes[0].options[0].label = '左 | 右';
  fixture.report.entries[0].scenes[0].optionChecks[0].reason = '理由A | 理由B\n次の行';
  fixture.writeManuscript();
  exportDraftDocuments('batch-999', fixture.root);
  const html = fs.readFileSync(path.join(fixture.directory, 'manuscript.html'), 'utf8');
  assert.ok(html.includes('&lt;script&gt;bad()&lt;/script&gt;'));
  assert.equal(descendants(parse(html)).filter(node => node.tagName === 'script').length, 0);
  const answers = fs.readFileSync(path.join(fixture.directory, 'review/answerChecks.md'), 'utf8');
  assert.ok(answers.includes('左 &#124; 右'));
  assert.ok(answers.includes('理由A &#124; 理由B<br>次の行'));
});

test('確認後の編集がある場合は既存の閲覧用資料を書き換えない', t => {
  const fixture = createReviewFixture(t);
  exportDraftDocuments('batch-999', fixture.root);
  const target = path.join(fixture.directory, 'manuscript.html');
  const before = fs.readFileSync(target);
  fs.appendFileSync(fixture.manuscriptPath, '\n');
  assert.throws(() => exportDraftDocuments('batch-999', fixture.root), /確認対象と原稿/);
  assert.deepEqual(fs.readFileSync(target), before);
});
