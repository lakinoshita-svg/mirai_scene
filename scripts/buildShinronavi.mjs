import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { extractPage, scopeCss } from './lib/shinronaviExport.mjs';

const root=process.cwd();
const parent=path.join(root,'tmp');
fs.mkdirSync(parent,{recursive:true});
const build=fs.mkdtempSync(path.join(parent,'shinronavi-build-'));
const output=path.join(root,'integrations/shinronavi/output');
// 通常のGitHub Pagesビルドとは出力先を分ける。環境変数はこの子プロセスにのみ設定。
const result=spawnSync(process.execPath,['node_modules/astro/bin/astro.mjs','build','--outDir',path.join(build,'dist')],{
  cwd:root,encoding:'utf8',env:{...process.env,ASTRO_SITE:'https://shinronavi.com',ASTRO_BASE:'/mirai_scene/',INQUIRY_BASE_URL:''},
});
fs.writeFileSync(path.join(build,'build.log'),(result.stdout||'')+(result.stderr||''));
if(result.status!==0) throw new Error(`Astro build failed: ${build}/build.log`);
const dist=path.join(build,'dist');
// 出力は毎回新しいディレクトリに作り、前回の配布物や原稿を削除しない。
fs.mkdirSync(output,{recursive:true});
const target=fs.mkdtempSync(path.join(output,'release-'));
const privateDir=path.join(target,'new/_app/_view/miraiscene/generated');
fs.mkdirSync(privateDir,{recursive:true});
const copy=(source,destination)=>{const file=path.join(target,destination);fs.mkdirSync(path.dirname(file),{recursive:true});fs.cpSync(source,file,{recursive:true});};
for(const name of ['assets','catalog','integration','favicon.svg']) copy(path.join(dist,name),`new/_app/_webroot/miraiscene/${name}`);
copy(path.join(dist,'_astro'),'new/_app/_webroot/js/page/miraiscene');
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(path.join(dir,entry.name)):[path.join(dir,entry.name)]);
const manifest={}; const css=new Set();
for(const file of walk(dist).filter(file=>file.endsWith('index.html') && !path.relative(dist,file).startsWith('catalog'))) {
  const page=extractPage(fs.readFileSync(file,'utf8'));
  // Astroが短いmoduleをinline化しても、配布Viewには処理を埋め込まない。
  for(const code of page.inlineScripts) {
    const scriptName=`mirai-${crypto.createHash('sha256').update(code).digest('hex')}.js`;
    fs.writeFileSync(path.join(target,'new/_app/_webroot/js/page/miraiscene',scriptName),code);
    page.scripts.push(`/mirai_scene/_astro/${scriptName}`);
  }
  const route=path.relative(dist,path.dirname(file)).replaceAll(path.sep,'/');
  const filename=crypto.createHash('sha256').update(route).digest('hex')+'.html';
  fs.writeFileSync(path.join(privateDir,filename),page.html);
  for(const href of page.links) {
    if(!href.startsWith('/mirai_scene/_astro/')) throw new Error(`Unexpected stylesheet: ${href}`);
    css.add(fs.readFileSync(path.join(dist,href.slice('/mirai_scene/'.length)),'utf8'));
  }
  page.styles.forEach(style=>css.add(style));
  if(page.scripts.some(src=>!src.startsWith('/mirai_scene/_astro/'))) throw new Error('Unexpected script source');
  manifest[route]={file:filename,title:page.title,description:page.description,scripts:page.scripts,canonical:`https://shinronavi.com/mirai_scene/${route ? route+'/' : ''}`};
}
fs.writeFileSync(path.join(privateDir,'manifest.json'),JSON.stringify(manifest,null,2));
fs.writeFileSync(path.join(privateDir,'.htaccess'),'Require all denied\n');
const cssDir=path.join(target,'new/_app/_webroot/css/page/miraiscene');
fs.mkdirSync(cssDir,{recursive:true});
fs.writeFileSync(path.join(cssDir,'miraiscene.css'),scopeCss([...css,fs.readFileSync('src/styles/brandLogo.css','utf8'),fs.readFileSync('src/styles/brandNavigation.css','utf8')].join('\n'))+'\n#mirai-scene{font-family:inherit}\n');
const templates='integrations/shinronavi/templates';
copy(`${templates}/MiraisceneController.php`,'new/_app/_controller/MiraisceneController.php');
copy(`${templates}/MiraiPageService.php`,'new/_app/_util/miraiscene/MiraiPageService.php');
copy(`${templates}/index.tpl`,'new/_app/_view/miraiscene/index.tpl');
copy(`${templates}/head.tpl`,'new/_app/_view/miraiscene/head.tpl');
copy(`${templates}/banner.tpl`,'new/_app/_view/miraiscene/banner.tpl');
copy(`${templates}/banner.css`,'new/_app/_webroot/css/page/miraiscene/banner.css');
copy(`${templates}/install.mjs`,'install.mjs');
copy(`${templates}/rewrite.conf`,'rewrite-addition.conf');
fs.copyFileSync('integrations/shinronavi/README.md',path.join(target,'INSTALL.md'));
// 運用担当へ渡す手順書も毎回同じリリースへ同梱し、旧版との混在を防ぐ。
copy('outputs/operations/運用マニュアル.html','運用マニュアル.html');
if(fs.existsSync('integrations/shinronavi/VALIDATION.md')) fs.copyFileSync('integrations/shinronavi/VALIDATION.md',path.join(target,'VALIDATION.md'));
fs.writeFileSync(path.join(output,'latest.json'),JSON.stringify({directory:target,pages:Object.keys(manifest).length},null,2));
console.log(`進路ナビ配置用: ${target}\n本文${Object.keys(manifest).length}ページ。INSTALL.mdの配置・rewrite手順を確認してください。`);
