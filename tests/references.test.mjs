import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Every scene exposes its reference and accurately identifies unreviewed content', () => {
  for (const file of fs.readdirSync('src/content/careers').filter(f => f.endsWith('.json'))) {
    const career = JSON.parse(fs.readFileSync(`src/content/careers/${file}`, 'utf8'));
    const html = fs.readFileSync(path.join(process.env.TEST_DIST || 'dist', 'careers', career.slug, 'index.html'), 'utf8');
    assert.equal((html.match(/class="scene-evidence"/g) || []).length, career.scenes.length);
    assert.ok(html.includes(career.reference.url));
    for (const scene of career.scenes) assert.ok(html.includes(scene.workConnection), `${career.slug}/${scene.id}`);
    if (career.reviewStatus === 'editorial-draft') {
      assert.equal((html.match(/専門家によるシーン監修：未実施/g) || []).length, career.scenes.length);
      assert.ok(!html.includes('専門家によるシーン監修：確認済み'));
    } else {
      assert.ok(career.review?.reviewer && career.review?.reviewedAt && career.review?.scope);
    }
  }
});
