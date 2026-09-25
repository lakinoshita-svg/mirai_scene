import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const output=path.resolve(process.env.TEST_DIST || 'dist');
const base=(process.env.ASTRO_BASE || '/').replace(/\/$/,'');
const careers=fs.readdirSync('src/content/careers').filter(n=>n.endsWith('.json')).map(n=>JSON.parse(fs.readFileSync(`src/content/careers/${n}`,'utf8')));
const read=p=>fs.readFileSync(path.join(output,p),'utf8');
test('Every JSON career has a prerendered route and its explanations',()=>{
 const index=read('index.html');
 for(const c of careers){
  assert.ok(index.includes(`href="${base}/careers/${c.slug}/"`),c.slug);
  const page=read(`careers/${c.slug}/index.html`);
  assert.ok(page.includes(c.scenes[0].title),`${c.slug}: first scene rendered without JS`);
  assert.equal((page.match(/data-scene-form=/g)||[]).length,c.scenes.length);
  assert.equal((page.match(/data-explanation=/g)||[]).length,c.scenes.reduce((n,s)=>n+s.options.length,0));
  assert.ok(page.includes('data-summary'));
  assert.ok(!page.includes('src="content.js"'));
  assert.equal((page.match(/data-context-explanation/g)||[]).length,c.scenes.length);
  for(const scene of c.scenes){
   assert.ok(page.includes(scene.contextExplanation),`${c.slug}/${scene.id}: common explanation missing`);
   for(const option of scene.options){
    for(const field of ['explanation','benefit','caution']){
     assert.ok(typeof option[field]==='string' && option[field].trim(),`${c.slug}/${scene.id}/${option.id}: ${field} required`);
     assert.equal(page.split(option[field]).length-1,2,`${c.slug}/${scene.id}/${option.id}: ${field} must appear in selected and comparison views`);
    }
   }
  }
 }
});
test('Local links and assets exist and respect the configured base',()=>{
 const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
 for(const filename of walk(output).filter(n=>n.endsWith('.html'))){
  const html=fs.readFileSync(filename,'utf8');
  for(const match of html.matchAll(/\b(?:href|src)="([^"#]+)"/g)){
   const url=match[1];if(/^(https?:|data:|mailto:)/.test(url))continue;
   assert.ok(url.startsWith(`${base}/`),`${filename}: wrong base: ${url}`);
   const relative=url.slice(base.length).split(/[?#]/)[0].replace(/^\//,'');
   let target=path.join(output,relative);if(url.endsWith('/'))target=path.join(target,'index.html');
   assert.ok(fs.existsSync(target),`${filename}: missing ${url}`);
  }
 }
});
