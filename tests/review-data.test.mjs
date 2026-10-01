import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import path from 'node:path';
import { flatten, loadReviewData } from '../scripts/lib/review-data.mjs';

test('review rows preserve falsy values, empty collections and escaped JSON pointers', () => {
  const rows = [];
  flatten({'a/b~c': 0, flag: false, blank: '', list: [], object: {}, nil: null}, '', 'test', rows, 'sample');
  assert.deepEqual(rows.map(row => [row[8], row[3]]), [
    ['/a~1b~0c', 0], ['/flag', false], ['/blank', ''], ['/list', '[]'], ['/object', '{}'], ['/nil', null],
  ]);
});

test('every review row resolves back to its current source without changing values', async () => {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const data = await loadReviewData(root);
  const config = {};
  for (const source of data.sources.filter(source => source.file.startsWith('src/data/'))) {
    config[path.basename(source.file)] = JSON.parse(await fs.readFile(path.join(root, source.file), 'utf8'));
  }
  for (const [rows, originals] of [[data.rows, Object.fromEntries(data.careers.map(career => [career.slug, career]))], [data.configs, config]]) {
    const identifiers = new Set();
    for (const row of rows) {
      const identity = row[0] + row[8];
      assert.ok(!identifiers.has(identity), identity);
      identifiers.add(identity);
      let value = originals[row[0]];
      for (const part of row[8].split('/').slice(1)) value = value[part.replace(/~1/g, '/').replace(/~0/g, '~')];
      assert.deepEqual(row[3], value !== null && typeof value === 'object' ? JSON.stringify(value) : value);
    }
  }
  assert.equal(data.sources.length, data.careers.length + Object.keys(config).length);
});
