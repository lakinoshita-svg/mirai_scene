import fs from 'node:fs';
import path from 'node:path';
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
const nextLayout=withHead.replaceAll('$_SERVER[" REQUEST_URI"]', "htmlspecialchars($_SERVER[\"REQUEST_URI\"], ENT_QUOTES, 'UTF-8')");
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
// バックアップはWeb公開ディレクトリの外、プロジェクトと同階層に置く。
const backup=fs.mkdtempSync(path.join(path.dirname(target),'mirai-backup-'));
const write=(relative,data)=>{
  const file=path.join(target,relative);
  if(fs.existsSync(file)) {
    if(fs.readFileSync(file).equals(Buffer.from(data))) return;
    const saved=path.join(backup,relative);fs.mkdirSync(path.dirname(saved),{recursive:true});fs.copyFileSync(file,saved);
  }
  fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,data);
};
const copy=relative=>{
  for(const entry of fs.readdirSync(path.join(source,relative),{withFileTypes:true})) {
    const file=path.join(relative,entry.name);
    if(entry.isDirectory()) copy(file); else write(file,fs.readFileSync(path.join(source,file)));
  }
};
copy('new');
write('new/_app/_view/layout/default_new.tpl',nextLayout);
write('sitemap_second.php',nextSitemap);
write('.htaccess',nextConfig);
console.log(`配置しました: ${target}\n変更前ファイル: ${backup}\n.htaccess.baseから本番設定を再生成する場合は、同じrewrite追記をテンプレートにも反映してください。`);
