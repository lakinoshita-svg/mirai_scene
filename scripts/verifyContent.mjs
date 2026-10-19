import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { sourceSnapshot } from './lib/sourceSnapshot.mjs';
const root = process.cwd();
const before = sourceSnapshot(root);
const commands = [['scripts/contentAudit.mjs'], ['node_modules/@astrojs/check/bin/astro-check.js'], ['node_modules/astro/bin/astro.mjs', 'build'], ['--test', ...fs.readdirSync('tests').filter(name => name.endsWith('.test.mjs')).map(name => `tests/${name}`)], ['scripts/syncInquiryLinks.mjs']];
for (const command of commands) {
  const result = spawnSync(process.execPath, command, {stdio:'inherit'});
  if (result.status !== 0) process.exit(result.status || 1);
}
const after = sourceSnapshot(root);
if (before.sha256 !== after.sha256) throw new Error('検証中に編集元が変わっています。検証を再実行してください。');
fs.mkdirSync('tmp', {recursive:true});
fs.writeFileSync('tmp/contentVerification.json', JSON.stringify({sourceHash:after.sha256, verifiedAt:new Date().toISOString()}, null, 2));
