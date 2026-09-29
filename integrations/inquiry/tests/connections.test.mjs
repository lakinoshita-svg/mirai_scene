import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const data = JSON.parse(fs.readFileSync('src/forteacher/data/mirai-links.json', 'utf8'));
const lessons = ['university', 'vocational'].flatMap(type => JSON.parse(fs.readFileSync(`src/forteacher/data/${type}.json`, 'utf8')));
test('Every mapped lesson exposes its related careers, and unmapped lessons do not', () => {
  for (const lesson of lessons) {
    const html = fs.readFileSync(`dist/forteacher/${lesson.slug}/index.html`, 'utf8');
    assert.equal(html.includes('id="mirai-title"'), Boolean(data[lesson.slug]), lesson.slug);
    for (const career of data[lesson.slug]?.careers || []) assert.ok(html.includes(`/careers/${career.slug}/`));
    for (const m of html.matchAll(/href="(\/forteacher\/[^"?#]+)"/g)) assert.ok(fs.existsSync(`dist${m[1].replace(/\/$/, '')}/index.html`), m[1]);
  }
});
test('Both lesson lists link to generated static pages', () => {
  for (const list of ['uni_lesson_list', 'voc_lesson_list']) {
    const html = fs.readFileSync(`dist/forteacher/${list}/index.html`, 'utf8');
    assert.ok(!html.includes('/forteacher/lesson?slug='));
    for (const m of html.matchAll(/href="(\/forteacher\/[^"?#]+)"/g)) assert.ok(fs.existsSync(`dist${m[1].replace(/\/$/, '')}/index.html`), m[1]);
  }
});
