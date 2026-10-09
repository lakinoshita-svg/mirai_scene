import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { extractPage } from '../scripts/lib/shinronaviExport.mjs';
import { flatten } from '../scripts/lib/reviewData.mjs';
import { parse } from 'parse5';

test('progress exposes each scene position and related work links target the catalog', () => {
  const html = fs.readFileSync('dist/careers/tourism/index.html', 'utf8');
  const visit = node => [node, ...(node.childNodes || []).flatMap(visit)];
  const nodes = visit(parse(html));
  const attr = (node, name) => node.attrs?.find(item => item.name === name)?.value;
  const bars = nodes.filter(node => attr(node, 'role') === 'progressbar');
  assert.deepEqual(bars.map(node => attr(node, 'aria-valuenow')), ['1', '2', '3']);
  assert.ok(bars.every(node => attr(node, 'aria-valuemax') === '3'));
  assert.ok(nodes.some(node => attr(node, 'href')?.endsWith('/explore/tourism/#experiences')));
  assert.ok(html.includes('ほかの観光の仕事体験を見る'));
});

test('about includes descriptive search metadata and canonical for the configured host', () => {
  const html = fs.readFileSync('dist/about/index.html', 'utf8');
  assert.match(html, /<title>高校生のオンライン仕事体験/);
  assert.match(html, /name="description" content="ミライシーンは高校生/);
  const canonical = html.match(/rel="canonical" href="([^"]+)"/)[1];
  assert.equal(new URL(canonical).origin, process.env.ASTRO_SITE || 'https://lakinoshita-svg.github.io');
  assert.ok(canonical.endsWith('/about/'));
});

test('every published scene has a distinct reflection response in the generated page', () => {
  for (const file of fs.readdirSync('src/content/careers').filter(file => file.endsWith('.json'))) {
    const career = JSON.parse(fs.readFileSync(`src/content/careers/${file}`, 'utf8'));
    const responses = career.scenes.map(scene => scene.reflectionResponse);
    assert.equal(new Set(responses).size, 3, file);
    const html = fs.readFileSync(`dist/careers/${career.slug}/index.html`, 'utf8');
    for (const response of responses) {
      assert.ok(response?.trim(), file);
      assert.ok(html.includes(response), `${file}: response absent from page`);
    }
  }
});

test('host integration retains service identity on home, career and field pages', () => {
  for (const route of ['', 'careers/designer/', 'explore/design/', 'about/']) {
    const page = extractPage(fs.readFileSync(`dist/${route}index.html`, 'utf8'));
    assert.match(page.html, /data-service-identity/);
    assert.match(page.html, /ミライシーン ホーム/);
    assert.doesNotMatch(page.html, /class="site-header"/);
  }
});

test('review output identifies reflection text in Japanese and preserves its JSON pointer', () => {
  const rows = [];
  flatten({reflectionResponse: '場面への感想'}, '/scenes/0', '', rows, 'sample');
  assert.equal(rows[0][2], '体験後の振り返り文');
  assert.equal(rows[0][8], '/scenes/0/reflectionResponse');
});
