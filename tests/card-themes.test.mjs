import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Every career card uses its configured shared theme asset', () => {
  const themes = JSON.parse(fs.readFileSync('src/data/interests.json','utf8'));
  const careers = fs.readdirSync('src/content/careers').map(file => JSON.parse(fs.readFileSync(`src/content/careers/${file}`,'utf8')));
  const html = fs.readFileSync(path.join(process.env.TEST_DIST || 'dist','index.html'),'utf8');
  for (const career of careers) {
    const theme = themes.find(theme => theme.id === career.cardTheme);
    assert.ok(theme, career.slug);
    assert.ok(fs.existsSync(`public/${theme.image}`));
    const card = html.match(new RegExp(`<a[^>]*data-career="${career.slug}"[\\s\\S]*?</a>`))?.[0];
    assert.ok(card?.includes(theme.image), `${career.slug}: wrong theme image`);
    assert.ok(!card.includes('word-art'), `${career.slug}: legacy artwork`);
  }
});
