import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// 固定ZIPだけを確認する。原稿の追加により制作側srcが変わることは正常なので比較しない。
const directory = 'deliveries/initial-2026-10-02';
const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'manifest.json'), 'utf8'));
const zip = path.join(directory, manifest.zip);
if (!fs.existsSync(zip)) throw new Error('初期導入ZIPがありません。別途共有された固定版をdeliveries配下に配置してください。');
const digest = crypto.createHash('sha256').update(fs.readFileSync(zip)).digest('hex');
if (digest !== manifest.sha256) throw new Error('初期導入ZIPのハッシュが一致しません。版を確認してください。');
console.log(`${manifest.release}: ${manifest.contentCount}体験の固定ZIPは保存時と一致しています。`);
