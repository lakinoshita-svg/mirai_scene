import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {sourceSnapshot,approvalErrors,digest} from '../scripts/lib/sourceSnapshot.mjs';
import {catalogReturn} from '../src/lib/catalogNavigation.mjs';
import {loadReviewData} from '../scripts/lib/reviewData.mjs';

test('publication approval is bound to exact content and is independent of review status',()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'miraiApproval-'));
  const dir=path.join(root,'src/content/careers'); fs.mkdirSync(dir,{recursive:true});
  const raw=JSON.stringify({slug:'designer',reviewStatus:'reviewed'});
  fs.writeFileSync(path.join(dir,'designer.json'),raw);
  assert.equal(approvalErrors(root,{}).length,1);
  const approvals={designer:{sha256:digest(raw),approvedBy:'確認担当',approvedAt:'2026-10-19',scope:'公開対象の確認'}};
  assert.deepEqual(approvalErrors(root,approvals),[]);
  fs.writeFileSync(path.join(dir,'designer.json'),raw+'\n');
  assert.equal(approvalErrors(root,approvals).length,1);
  const before=sourceSnapshot(root).sha256;
  fs.mkdirSync(path.join(root,'outputs'));fs.writeFileSync(path.join(root,'outputs/report.html'),'report');
  assert.equal(sourceSnapshot(root).sha256,before);
  fs.writeFileSync(path.join(dir,'designer.json'),raw);
  assert.notEqual(sourceSnapshot(root).sha256,before);
});

test('catalog return accepts only same-origin service lists',()=>{
  const origin='https://example.test',base='/mirai_scene/';
  assert.equal(catalogReturn('/mirai_scene/explore/design/?resume=designer#experiences',origin,base),'/mirai_scene/explore/design/?resume=designer#experiences');
  for(const url of ['https://outside.test/mirai_scene/','//outside.test/mirai_scene/','javascript:alert(1)','/mirai_scene/careers/designer/','/mirai_scene/../admin/','/other/']) assert.equal(catalogReturn(url,origin,base),null);
});

test('review selection reads drafts directly and rejects unknown IDs and traversal',async()=>{
  const root=process.cwd();
  const selected=await loadReviewData(root,{ids:['designer']});
  assert.deepEqual(selected.careers.map(c=>c.slug),['designer']);
  const drafts=await loadReviewData(root,{batch:'batch-001'});
  assert.equal(drafts.careers.length,2);
  assert.ok(drafts.sources.some(source=>source.file.startsWith('drafts/batch-001/')));
  await assert.rejects(loadReviewData(root,{ids:['missing-id']}));
  await assert.rejects(loadReviewData(root,{batch:'../src'}));
});
