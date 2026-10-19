import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {contentPlan,applyContent,hash,isContentFile} from '../integrations/shinronavi/templates/contentDelivery.mjs';
import {runtimeHash} from '../scripts/lib/sourceSnapshot.mjs';

test('runtime compatibility permits content and documentation but requires matching shared code',()=>{
  const files={'src/content/careers/designer.json':'one','public/assets/scenes/poster.webp':'one','src/data/learningLinks.json':'same','scripts/buildShinronavi.mjs':'same','docs/OPERATIONS.md':'one'};
  const initial=runtimeHash({files});
  files['src/content/careers/designer.json']='two';
  files['public/assets/scenes/poster.webp']='two';
  files['docs/OPERATIONS.md']='two';
  assert.equal(runtimeHash({files}),initial);
  files['src/data/learningLinks.json']='different';
  assert.notEqual(runtimeHash({files}),initial);
});

const page='new/_app/_view/miraiscene/generated/page.html';
const card='new/_app/_webroot/miraiscene/catalog/cards/designer/index.html';
const controller='new/_app/_controller/MiraisceneController.php';
function fixture() {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'miraiContent-'));
  const source=path.join(root,'package'), target=path.join(root,'host');
  const write=(base,file,bytes)=>{const full=path.join(base,file);fs.mkdirSync(path.dirname(full),{recursive:true});fs.writeFileSync(full,bytes);};
  const before={[page]:hash('page one'),[controller]:hash('host contract')};
  const after={[card]:hash('card two'),[controller]:hash('host contract')};
  const plan=contentPlan({runtimeHash:'same',files:before},{runtimeHash:'same',files:after});
  write(source,'contentManifest.json',JSON.stringify(plan));write(source,card,'card two');
  write(target,page,'page one');write(target,controller,'host contract');write(target,'unrelated.txt','keep');
  return {root,source,target,write,plan};
}
test('content package supports dry run, add, removal, replay and preserved host files',()=>{
  const f=fixture();
  assert.equal(applyContent(f.source,f.target,{dryRun:true}).state,'配置前確認');
  assert.ok(fs.existsSync(path.join(f.target,page)));
  assert.ok(!fs.existsSync(path.join(f.target,card)));
  const result=applyContent(f.source,f.target);
  assert.equal(result.state,'配置完了');
  assert.equal(fs.readFileSync(path.join(f.target,card),'utf8'),'card two');
  assert.ok(!fs.existsSync(path.join(f.target,page)));
  assert.equal(fs.readFileSync(path.join(f.target,controller),'utf8'),'host contract');
  assert.equal(fs.readFileSync(path.join(f.target,'unrelated.txt'),'utf8'),'keep');
  assert.equal(fs.readFileSync(path.join(result.backup,page),'utf8'),'page one');
  assert.equal(applyContent(f.source,f.target).state,'一致');
});
test('host customization and corrupt payload stop before any writes',()=>{
  for(const kind of ['host','payload']) {
    const f=fixture();
    if(kind==='host') f.write(f.target,page,'host custom'); else f.write(f.source,card,'corrupt');
    assert.throws(()=>applyContent(f.source,f.target));
    assert.ok(!fs.existsSync(path.join(f.target,card)));
    assert.equal(fs.readFileSync(path.join(f.target,page),'utf8'),kind==='host'?'host custom':'page one');
  }
});
test('runtime changes, PHP changes and path traversal cannot enter a content package',()=>{
  assert.throws(()=>contentPlan({runtimeHash:'a',files:{}},{runtimeHash:'b',files:{}}));
  assert.throws(()=>contentPlan({files:{}},{files:{}}));
  assert.throws(()=>contentPlan({runtimeHash:'a',files:{}},{runtimeHash:'a',files:{[controller]:hash('php')}}));
  assert.equal(isContentFile('new/_app/_webroot/miraiscene/catalog/../../other.js'),false);
  assert.equal(isContentFile('new/_app/_webroot/miraiscene/catalog/script.php'),false);
  const f=fixture();f.plan.files.push('../outside.txt');f.write(f.source,'contentManifest.json',JSON.stringify(f.plan));
  assert.throws(()=>applyContent(f.source,f.target));
});
