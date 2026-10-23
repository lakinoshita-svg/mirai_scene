import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { digest } from '../../scripts/lib/sourceSnapshot.mjs';

export function createReviewFixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'miraiEditorialTest-'));
  const directory = path.join(root, 'drafts/batch-999');
  fs.mkdirSync(path.join(directory, 'review'), { recursive: true });
  const manuscript = {
    slug: 'example', order: 1, name: '職業名', category: '分野', entryTitle: '体験の見出し',
    description: '体験の説明', learning: '関連する学び',
    reference: { publisher: '参照元', title: '資料名', url: 'https://example.com/source', checkedAt: '2026-10-22' },
    scenes: [1, 2, 3].map(index => ({
      id: `scene-${index}`, title: `場面${index}`, situation: '判断に必要な条件', question: '何を考える？',
      contextExplanation: '状況の整理', perspective: '仕事の視点', insight: '気になったこと',
      reflectionResponse: '気持ちの言語化', workConnection: '業務との対応',
      options: [1, 2, 3].map(number => ({ id: `option-${number}`, label: `行動${number}`, explanation: '行動の説明', benefit: '期待できること', caution: '残る条件' })),
    })),
  };
  const pass = { reviewer: 'fixture reviewer', checkedAt: '2026-10-22', method: 'fixture method' };
  const decision = () => ({ status: 'pass', reason: '条件と行動の対応を確認' });
  const report = {
    batchId: 'batch-999', passes: { occupational: { ...pass }, editorial: { ...pass } },
    entries: [{ slug: 'example', sources: ['fixture source'], scenes: manuscript.scenes.map(scene => ({
      sceneId: scene.id, optionIds: scene.options.map(option => option.id),
      occupational: decision(), editorial: decision(),
      optionChecks: scene.options.map(option => ({ optionId: option.id, ...decision() })),
    })) }],
  };
  const manuscriptPath = path.join(directory, 'example.json');
  const writeReport = () => fs.writeFileSync(path.join(directory, 'review/occupationChecks.json'), JSON.stringify(report));
  const writeManuscript = () => {
    const bytes = JSON.stringify(manuscript);
    fs.writeFileSync(manuscriptPath, bytes);
    report.entries[0].sha256 = digest(bytes);
    writeReport();
  };
  writeManuscript();
  fs.writeFileSync(path.join(directory, 'README.md'), '確認用原稿の案内');
  fs.writeFileSync(path.join(directory, 'REVIEW.md'), '確認範囲の記録');
  fs.mkdirSync(path.join(root, 'docs/editorial'), { recursive: true });
  fs.writeFileSync(path.join(root, 'docs/editorial/company-career-material.txt'), '自社原文の確認用fixture');
  t.after(() => {
    if (path.dirname(root) !== path.resolve(os.tmpdir()) || !path.basename(root).startsWith('miraiEditorialTest-')) throw new Error('一時ディレクトリの範囲が不正です。');
    fs.rmSync(root, { recursive: true, force: true });
  });
  return { root, directory, report, manuscript, manuscriptPath, writeReport, writeManuscript };
}
