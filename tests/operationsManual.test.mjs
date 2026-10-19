import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildOperationsManual } from '../scripts/lib/operationsManual.mjs';

test('manual uses the supplied project and rejects unknown template values before writing', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'miraiManual-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const dir of ['config', 'src/content/careers', 'docs']) {
    fs.mkdirSync(path.join(root, dir), { recursive: true });
  }
  fs.writeFileSync(path.join(root, 'config/delivery.json'), JSON.stringify({
    release: 'release-2026-10-16', zip: 'delivery.zip', date: '2026-10-16',
  }));
  fs.writeFileSync(path.join(root, 'src/content/careers/example.json'), JSON.stringify({ scenes: [{}, {}, {}] }));
  const template = path.join(root, 'docs/operationsManual.html');
  fs.writeFileSync(template, '{{contentCount}}/{{sceneCount}} {{releasePath}} {{date}}');
  const result = buildOperationsManual(root);
  const expected = '1/3 deliveries/release-2026-10-16/delivery.zip 2026-10-16';
  assert.equal(fs.readFileSync(result.outputPath, 'utf8'), expected);
  for (const key of ['unknown', 'toString']) {
    fs.writeFileSync(template, `{{${key}}}`);
    assert.throws(() => buildOperationsManual(root), /マニュアルの未定義項目/);
    assert.equal(fs.readFileSync(result.outputPath, 'utf8'), expected);
  }
});
