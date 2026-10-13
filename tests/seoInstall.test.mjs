import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

test('installer connects sitemap once, preserves robots and corrects OGP URL key', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'miraiSeo-'));
  const source = path.join(directory, 'package');
  const target = path.join(directory, 'host');
  const write = (file, text) => { fs.mkdirSync(path.dirname(file), {recursive:true}); fs.writeFileSync(file,text); };
  write(path.join(source,'install.mjs'), fs.readFileSync('integrations/shinronavi/templates/install.mjs'));
  write(path.join(source,'rewrite-addition.conf'), '# fixture rule');
  write(path.join(source,'new/_app/_util/miraiscene/sitemapUrls.php'), '<?php return [];');
  write(path.join(target,'new/_app/_controller/Controller.php'), '<?php');
  write(path.join(target,'new/_app/_view/layout/default_new.tpl'), '<head><?= $_SERVER[" REQUEST_URI"] ?></head>');
  write(path.join(target,'.htaccess'), 'RewriteEngine on\n# existing rules');
  write(path.join(target,'robots.txt'), 'sitemap: https://shinronavi.com/sitemap_second.php\n');
  write(path.join(target,'sitemap_second.php'), "<?php\n$urls = [];\nheader('Content-Type: application/xml');\n");
  const run = () => spawnSync(process.execPath,[path.join(source,'install.mjs'),target],{encoding:'utf8'});
  assert.equal(run().status,0);
  const before = fs.readFileSync(path.join(target,'sitemap_second.php'),'utf8');
  assert.equal(run().status,0);
  assert.equal(fs.readFileSync(path.join(target,'sitemap_second.php'),'utf8'), before);
  assert.equal((before.match(/sitemapUrls\.php/g)||[]).length,1);
  assert.match(fs.readFileSync(path.join(target,'new/_app/_view/layout/default_new.tpl'),'utf8'), /\$_SERVER\["REQUEST_URI"\]/);
  assert.equal(fs.readFileSync(path.join(target,'robots.txt'),'utf8'),'sitemap: https://shinronavi.com/sitemap_second.php\n');
  // 不明なホスト構造ではファイル配置前に停止する。
  write(path.join(target,'sitemap_second.php'), '<?php // unknown structure');
  const originalLayout=fs.readFileSync(path.join(target,'new/_app/_view/layout/default_new.tpl'),'utf8');
  assert.notEqual(run().status,0);
  assert.equal(fs.readFileSync(path.join(target,'new/_app/_view/layout/default_new.tpl'),'utf8'),originalLayout);
});
