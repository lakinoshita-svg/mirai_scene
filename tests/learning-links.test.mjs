import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const root = process.env.TEST_DIST || 'dist';
const base = (process.env.ASTRO_BASE || '/mirai_scene/').replace(/\/$/, '');
const fields = JSON.parse(fs.readFileSync('src/data/learning-links.json', 'utf8'));
const careers = fs.readdirSync('src/content/careers').filter(f => f.endsWith('.json')).map(f => JSON.parse(fs.readFileSync(`src/content/careers/${f}`, 'utf8')));
const read = p => fs.readFileSync(path.join(root, p), 'utf8');

test('Every career has reciprocal learning links and a correctly encoded school search', () => {
  for (const career of careers) {
    const html = read(`careers/${career.slug}/index.html`);
    const expected = [...new Set(career.learningIds.flatMap(id => fields.find(f => f.id === id).schoolFields.map(f => f.id)))];
    const target = html.match(/href="(https:\/\/shinronavi.com\/search\/result\?[^"]+)"/);
    assert.ok(target, career.slug);
    assert.deepEqual(new URL(target[1].replaceAll('&amp;', '&')).searchParams.getAll('fld[]'), expected);
    for (const id of career.learningIds) {
      assert.ok(html.includes(`${base}/explore/${id}/`));
      assert.ok(read(`explore/${id}/index.html`).includes(`${base}/careers/${career.slug}/`));
    }
  }
});

test('Every mapped lesson gets a return destination generated from the same registry', () => {
  const manifest = JSON.parse(read('integration/lesson-links.json'));
  assert.equal(manifest.length, fields.reduce((sum, f) => sum + f.lessons.length, 0));
  for (const entry of manifest) {
    assert.equal(new URL(entry.lessonUrl).searchParams.get('slug'), entry.lessonSlug);
    const url = new URL(entry.miraiUrl);
    assert.ok(url.pathname.startsWith(`${base}/explore/`));
    assert.ok(fs.existsSync(path.join(root, url.pathname.slice(base.length), 'index.html')));
  }
});

test('Lesson widget supports shared lessons, explicit slug, and unknown lessons safely', () => {
  const code = read('integration/explore-widget.js');
  const run = (slug, explicit) => {
    const added = [];
    const make = tag => ({tag, children: [], append(...nodes) { this.children.push(...nodes); }});
    vm.runInNewContext(code, {
      URLSearchParams, location: {search: `?slug=${slug}`},
      document: {currentScript: {dataset: explicit ? {lesson: explicit} : {}, after(node) {added.push(node);}}, createElement: make},
    });
    return added;
  };
  assert.equal(run('unknown').length, 0);
  assert.equal(run('unknown', 'art_design').length, 1);
  const shared = run('engineering_info')[0].children[1].children;
  assert.equal(shared.length, 2);
  assert.ok(shared.every(item => item.children[0].href.includes(`${base}/explore/`)));
});
