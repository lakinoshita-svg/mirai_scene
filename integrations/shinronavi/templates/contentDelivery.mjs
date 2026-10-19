import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
export const hash = data => crypto.createHash('sha256').update(data).digest('hex');
export const stateRelative = 'new/_app/_view/miraiscene/installState.php';
export const statePrefix = '<?php exit; ?>\n';
const roots = ['new/_app/_view/miraiscene/generated/', 'new/_app/_webroot/miraiscene/catalog/', 'new/_app/_webroot/miraiscene/integration/', 'new/_app/_webroot/miraiscene/assets/scenes/', 'new/_app/_webroot/js/page/miraiscene/'];

export function isContentFile(file) {
  return !file.includes('\\') && !file.split('/').some(part => part === '..' || !part) &&
    (file === 'new/_app/_webroot/css/page/miraiscene/miraiscene.css' || roots.some(root=>file.startsWith(root))) &&
    /\.(html|json|js|css|png|jpg|jpeg|webp|svg)$/.test(file);
}
export function ownedFiles(record) {
  return Object.fromEntries(Object.entries(record.files).filter(([file])=>file.startsWith('new/')).sort(([a],[b])=>a.localeCompare(b)));
}
export const manifestId = files => hash(JSON.stringify(Object.entries(files).sort(([a],[b])=>a.localeCompare(b))));

// 共通コード・接続設定が同一のビルドだけを原稿更新として配布する。
export function contentPlan(base, next) {
  if (!base.runtimeHash || base.runtimeHash !== next.runtimeHash) throw new Error('共通実装・接続設定が一致しません。一式の配布が必要です。');
  const before=ownedFiles(base), after=ownedFiles(next);
  const files=Object.keys(after).filter(file=>before[file]!==after[file]);
  const removed=Object.keys(before).filter(file=>!Object.hasOwn(after,file));
  for (const file of [...files,...removed]) if (!isContentFile(file)) throw new Error('コンテンツ配布対象外: '+file);
  return {format:1,baseId:manifestId(before),targetId:manifestId(after),runtimeHash:next.runtimeHash,before,after,files,removed};
}

export function safeTarget(root, relative) {
  if (relative.includes('\\') || relative.split('/').some(part=>part==='..'||!part)) throw new Error('不正な配置パス: '+relative);
  const file=path.resolve(root,relative);
  if (!file.startsWith(root+path.sep)) throw new Error('配置先の外です: '+relative);
  for(let part=file;part!==root;part=path.dirname(part)) {
    if (fs.existsSync(part) && fs.lstatSync(part).isSymbolicLink()) throw new Error('リンク先には配置できません: '+relative);
  }
  return file;
}

export function applyContent(source, target, {dryRun=false}={}) {
  source=fs.realpathSync(source); target=fs.realpathSync(target);
  const plan=JSON.parse(fs.readFileSync(path.join(source,'contentManifest.json')));
  const canonical=contentPlan({files:plan.before,runtimeHash:plan.runtimeHash},{files:plan.after,runtimeHash:plan.runtimeHash});
  if (plan.format!==1 || JSON.stringify(plan)!==JSON.stringify(canonical)) throw new Error('配布manifestの整合性を確認してください');
  if (!Object.keys(plan.before).length) throw new Error('導入済みの基準が必要です');
  // 配布された各ファイルを照合し終えてから、配置先へアクセスする。
  const payload=new Map(plan.files.map(file=>{
    const bytes=fs.readFileSync(safeTarget(source,file));
    if (hash(bytes)!==plan.after[file]) throw new Error('配布内容の不一致: '+file);
    return [file,bytes];
  }));
  const actual = {};
  for(const file of new Set([...Object.keys(plan.before),...Object.keys(plan.after)])) {
    if (!file.startsWith('new/')) throw new Error('配置対象外: '+file);
    const full=safeTarget(target,file);
    if (fs.existsSync(full)) actual[file]=hash(fs.readFileSync(full));
  }
  const matches=(expected)=>Object.keys(expected).every(file=>actual[file]===expected[file]) && Object.keys(actual).every(file=>Object.hasOwn(expected,file));
  if(matches(plan.after)) return {state:'一致',files:[],removed:[]};
  if(!matches(plan.before)) throw new Error('導入済み版の不一致または独自調整があります。全ファイルを保持して停止します。');
  if(dryRun) return {state:'配置前確認',files:plan.files,removed:plan.removed};
  const statePath=safeTarget(target,stateRelative);
  const previousState=fs.existsSync(statePath)?fs.readFileSync(statePath):null;
  const state=previousState?JSON.parse(previousState.toString().slice(statePrefix.length)):{};
  const backup=fs.mkdtempSync(path.join(path.dirname(target),'miraiContentBackup-'));
  const actions=[...plan.files,...plan.removed,stateRelative].map(file=>{
    const full=safeTarget(target,file);
    return {file,full,before:fs.existsSync(full)?fs.readFileSync(full):null};
  });
  for(const action of actions) if(action.before) {
    const saved=path.join(backup,action.file);fs.mkdirSync(path.dirname(saved),{recursive:true});fs.writeFileSync(saved,action.before);
  }
  fs.writeFileSync(path.join(backup,'restoreManifest.json'),JSON.stringify({target,files:actions.map(a=>({file:a.file,existed:!!a.before}))},null,2));
  const completed=[];
  try {
    for(const action of actions) {
      completed.push(action);
      if(action.file===stateRelative) {
        for(const file of plan.removed) delete state[file];
        Object.assign(state,plan.after);
        fs.mkdirSync(path.dirname(statePath),{recursive:true});fs.writeFileSync(statePath,statePrefix+JSON.stringify(state,null,2));
      } else if(payload.has(action.file)) {
        fs.mkdirSync(path.dirname(action.full),{recursive:true});fs.writeFileSync(action.full,payload.get(action.file));
      } else fs.unlinkSync(action.full);
    }
  } catch(error) {
    for(const action of completed.reverse()) {
      if(action.before) fs.writeFileSync(action.full,action.before);
      else if(fs.existsSync(action.full)) fs.unlinkSync(action.full);
    }
    throw error;
  }
  return {state:'配置完了',files:plan.files,removed:plan.removed,backup};
}
