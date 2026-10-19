import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {parseArgs} from 'node:util';
import {contentPlan,hash} from '../integrations/shinronavi/templates/contentDelivery.mjs';
const {values}=parseArgs({options:{baseline:{type:'string'},plan:{type:'boolean'}}});
if(!values.baseline) throw new Error('npm run release:content -- --baseline "配置済み版のbuildManifest.json" [--plan]');
const latest=JSON.parse(fs.readFileSync('integrations/shinronavi/output/latest.json'));
const base=JSON.parse(fs.readFileSync(values.baseline,'utf8').replace(/^\uFEFF/,''));
const bundle=fs.realpathSync(latest.directory);
const output=fs.realpathSync('integrations/shinronavi/output');
if(!bundle.startsWith(output+path.sep)) throw new Error('生成元が出力フォルダ外です');
const next=JSON.parse(fs.readFileSync(path.join(bundle,'buildManifest.json')));
const plan=contentPlan(base,next);
if(values.plan) { console.log(JSON.stringify(plan,null,2)); process.exit(0); }
const verified=spawnSync(process.execPath,['scripts/verifyDelivery.mjs'],{stdio:'inherit'});
if(verified.status!==0) process.exit(1);
if(!plan.files.length&&!plan.removed.length) throw new Error('配布する差分がありません');
const target=fs.mkdtempSync(path.join(output,'content-'));
for(const file of plan.files) {
  const bytes=fs.readFileSync(path.join(bundle,file));
  if(hash(bytes)!==next.files[file]) throw new Error('生成物不一致: '+file);
  const destination=path.join(target,file);fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,bytes);
}
for(const file of ['installContent.mjs','contentDelivery.mjs']) fs.copyFileSync('integrations/shinronavi/templates/'+file,path.join(target,file));
fs.copyFileSync(path.join(bundle,'buildManifest.json'),path.join(target,'buildManifest.json'));
fs.copyFileSync('docs/CONTENT-DELIVERY.md',path.join(target,'INSTALL.md'));
fs.writeFileSync(path.join(target,'contentManifest.json'),JSON.stringify(plan,null,2));
fs.writeFileSync(path.join(output,'contentLatest.json'),JSON.stringify({directory:target,baseId:plan.baseId,targetId:plan.targetId},null,2));
console.log('コンテンツ配布フォルダー: '+target);
