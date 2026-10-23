import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
const source=path.dirname(fileURLToPath(import.meta.url));
if(!process.argv[2]) throw new Error('使い方: node install.mjs 進路ナビのプロジェクトルート');
const target=fs.realpathSync(path.resolve(process.argv[2]));
if(target===source) throw new Error('配布フォルダー自身は指定できません');
const layoutPath=path.join(target,'new/_app/_view/layout/default_new.tpl');
const configPath=path.join(target,'.htaccess');
if(!fs.existsSync(layoutPath)||!fs.existsSync(path.join(target,'new/_app/_controller/Controller.php'))) throw new Error('進路ナビのルートを指定してください');
const layout=fs.readFileSync(layoutPath,'utf8');
const config=fs.readFileSync(fs.existsSync(configPath)?configPath:path.join(target,'.htaccess.base'),'utf8');
if(!layout.includes('</head>')|| !/RewriteEngine\s+on/i.test(config)) throw new Error('共通レイアウトまたはrewriteの構造が変わっています');
const head="<?php require __DIR__ . '/../miraiscene/head.tpl'; ?>";
const withHead=layout.includes(head)?layout:layout.replace('</head>',`${head}\n</head>`);
// 提供元テンプレートのREQUEST_URIキーを補正。正しいキーの環境には作用しない。
const footer = "<? require_once '../_view/layout/_footer.tpl'; ?>";
const footerHook = "<?php if (!isset($this->mirai_page)) { require_once '../_view/layout/_footer.tpl'; } ?>";
if (!withHead.includes(footer) && !withHead.includes(footerHook)) throw new Error('共通フッターの呼び出し位置を確認してください');
const nextLayout=withHead.replace(footer,footerHook).replaceAll('$_SERVER[" REQUEST_URI"]', "htmlspecialchars($_SERVER[\"REQUEST_URI\"], ENT_QUOTES, 'UTF-8')");
const sitemapPath=path.join(target,'sitemap_second.php');
const sitemap=fs.readFileSync(sitemapPath,'utf8');
const sitemapHook="$urls = array_merge($urls, require __DIR__ . '/new/_app/_util/miraiscene/sitemapUrls.php');";
const xmlHeader="header('Content-Type: application/xml');";
if(!sitemap.includes(xmlHeader)) throw new Error('sitemap_second.phpのXML出力位置を確認してください');
const withSitemapHook=sitemap.includes(sitemapHook)?sitemap:sitemap.replace(xmlHeader,`${sitemapHook}\n\n${xmlHeader}`);
const nextSitemap=withSitemapHook.replaceAll('https://www.sitemaps.org/schemas/sitemap/0.9','http://www.sitemaps.org/schemas/sitemap/0.9');
const rules=fs.readFileSync(path.join(source,'rewrite-addition.conf'),'utf8');
const marker='# BEGIN MIRAI SCENE';
const block=`${marker}\n${rules}\n# END MIRAI SCENE`;
const cleaned=config.replace(/# BEGIN MIRAI SCENE[\s\S]*?# END MIRAI SCENE\r?\n?/g,'');
const nextConfig=cleaned.replace(/RewriteEngine\s+on/i,match=>`${match}\n${block}`);
// 全対象の事前照合を終えてから書き込む。独自調整との競合は上書きしない。
const hash = data => crypto.createHash('sha256').update(data).digest('hex');
const planned = new Map();
const collect = relative => {
  for (const entry of fs.readdirSync(path.join(source,relative),{withFileTypes:true})) {
    const file = relative + '/' + entry.name;
    if (entry.isSymbolicLink()) throw new Error('配布物にリンクを含められません: '+file);
    if (entry.isDirectory()) collect(file); else planned.set(file,fs.readFileSync(path.join(source,file)));
  }
};
collect('new');
planned.set('new/_app/_view/layout/default_new.tpl',Buffer.from(nextLayout));
planned.set('sitemap_second.php',Buffer.from(nextSitemap));
planned.set('.htaccess',Buffer.from(nextConfig));
const stateRelative = 'new/_app/_view/miraiscene/installState.php';
const stateFile = path.join(target,stateRelative);
const prefix = '<?php exit; ?>\n';
let baseline = {};
for (let part=stateFile;part!==target;part=path.dirname(part)) {
  if (fs.existsSync(part) && fs.lstatSync(part).isSymbolicLink()) throw new Error('配置記録にリンクは使用できません');
}
const previousState=fs.existsSync(stateFile)?fs.readFileSync(stateFile):null;
if (fs.existsSync(stateFile)) baseline = JSON.parse(fs.readFileSync(stateFile,'utf8').slice(prefix.length));
const baselineIndex = process.argv.indexOf('--baseline');
if (baselineIndex >= 0) {
  const manifest = JSON.parse(fs.readFileSync(process.argv[baselineIndex+1],'utf8').replace(/^\uFEFF/,''));
  baseline = Object.fromEntries(manifest.files.filter(item=>item.file.startsWith('new/')).map(item=>[item.file,item.sha256]));
}
const shared = new Set(['new/_app/_view/layout/default_new.tpl','sitemap_second.php','.htaccess']);
const actions = [];
for (const relative of new Set([...Object.keys(baseline),...planned.keys()])) {
  const file = path.resolve(target,relative);
  if (!file.startsWith(target+path.sep)) throw new Error('対象外のパス: '+relative);
  // 親ディレクトリを含むリンク経由の書き込みを拒否する。
  for (let part=file;part!==target;part=path.dirname(part)) {
    if (fs.existsSync(part) && fs.lstatSync(part).isSymbolicLink()) throw new Error('リンク先には配置できません: '+relative);
  }
  const before = fs.existsSync(file) ? fs.readFileSync(file) : null;
  const after = planned.get(relative) ?? null;
  if (before && after && before.equals(after)) continue;
  if (!before && !after) continue;
  if (before && hash(before)!==baseline[relative] && !(shared.has(relative)&&!baseline[relative])) throw new Error('導入先の独自調整と競合: '+relative);
  actions.push({relative,file,before,after});
}
console.log(actions.map(action=>(action.after ? action.before ? '配置' : '追加' : '削除')+': '+action.relative).join('\n') || '配置対象は一致しています');
if (process.argv.includes('--dry-run')) process.exit(0);
const backup=fs.mkdtempSync(path.join(path.dirname(target),'miraiBackup-'));
fs.writeFileSync(path.join(backup,'restoreManifest.json'),JSON.stringify({target,files:actions.map(({relative,before})=>({file:relative,existed:before!==null}))},null,2));
if (previousState) { const saved=path.join(backup,stateRelative);fs.mkdirSync(path.dirname(saved),{recursive:true});fs.writeFileSync(saved,previousState); }
const completed=[];
try {
  for (const action of actions) {
    if (action.before) {
      const saved=path.join(backup,action.relative);fs.mkdirSync(path.dirname(saved),{recursive:true});fs.writeFileSync(saved,action.before);
    }
    completed.push(action);
    if (action.after) { fs.mkdirSync(path.dirname(action.file),{recursive:true});fs.writeFileSync(action.file,action.after); }
    else fs.unlinkSync(action.file);
  }
  const state = Object.fromEntries([...planned].map(([name,data])=>[name,hash(data)]));
  fs.mkdirSync(path.dirname(stateFile),{recursive:true});
  fs.writeFileSync(stateFile,prefix+JSON.stringify(state,null,2));
} catch(error) {
  for (const action of completed.reverse()) {
    if (action.before) fs.writeFileSync(action.file,action.before);
    else if (fs.existsSync(action.file)) fs.unlinkSync(action.file);
  }
  if (previousState) fs.writeFileSync(stateFile,previousState);
  else if (fs.existsSync(stateFile)) fs.unlinkSync(stateFile);
  throw error;
}
console.log('配置先: '+target+'\n復旧用ファイル: '+backup+'\n本番は保守時間帯に配置し、GitLabの差分と結合動作を確認してください。');
