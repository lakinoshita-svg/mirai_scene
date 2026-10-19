import fs from 'node:fs';
import path from 'node:path';
import { sourceSnapshot, approvalErrors, digest } from './lib/sourceSnapshot.mjs';
const root = process.cwd();
const latest = JSON.parse(fs.readFileSync('integrations/shinronavi/output/latest.json'));
const bundle = path.resolve(latest.directory);
const output = path.resolve('integrations/shinronavi/output') + path.sep;
if (!bundle.startsWith(output)) throw new Error('配布元が出力フォルダ外です');
const record = JSON.parse(fs.readFileSync(path.join(bundle, 'buildManifest.json')));
const verification = JSON.parse(fs.readFileSync('tmp/contentVerification.json'));
const current = sourceSnapshot(root).sha256;
if (record.sourceHash !== current || verification.sourceHash !== current) throw new Error('編集元・検証・導入ビルドが一致しません。content:verify と build:shinronavi を実行してください。');
const errors = approvalErrors(root, JSON.parse(fs.readFileSync('config/publicationApprovals.json')));
if (errors.length) throw new Error(errors.join('\n'));
const actual = {};
function visit(dir, prefix='') {
  for (const item of fs.readdirSync(dir, {withFileTypes:true})) {
    const name = prefix + item.name;
    if (item.isDirectory()) visit(path.join(dir,item.name), name + '/');
    else if (name !== 'buildManifest.json') actual[name] = digest(fs.readFileSync(path.join(dir,item.name)));
  }
}
visit(bundle);
if (JSON.stringify(Object.entries(actual).sort()) !== JSON.stringify(Object.entries(record.files).sort())) throw new Error('生成物がビルド時と一致しません。導入ビルドを再実行してください。');
console.log('編集元・検証・公開承認・生成物の照合完了');
