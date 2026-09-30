import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { filterCatalog } from '../src/lib/catalog-filter.mjs';
test('300 entries preserve theme, learning and normalized AND search', () => {
 const items = Array.from({length:300},(_,i)=>({slug:`job-${i}`,name:`Web担当${i}`,category:'IT',cardTheme:i%2?'make':'solve',entryTitle:'仕組みを考える',description:'予約サイト',learningIds:i%3?['it']:['business']}));
 assert.equal(filterCatalog(items).length,300);
 assert.equal(filterCatalog(items,{interest:'solve'}).length,150);
 assert.equal(filterCatalog(items,{learning:'it',interest:'solve',query:'ＷＥＢ 予約'}).length,100);
 assert.equal(filterCatalog(items,{query:'存在しない語'}).length,0);
 for (const size of [8,9]) {
   const result=filterCatalog(items);
   const loaded=[];
   for(let start=0;start<result.length;start+=size) loaded.push(...result.slice(start,start+size));
   assert.equal(new Set(loaded.map(c=>c.slug)).size,300);
 }
});
test('HTML holds at most nine cards; index contains metadata only and every fragment exists', () => {
 const root=process.env.TEST_DIST || 'dist';
 const index=JSON.parse(fs.readFileSync(`${root}/catalog/index.json`,'utf8'));
 for(const page of ['index.html',...fs.readdirSync(`${root}/explore`,{withFileTypes:true}).filter(e=>e.isDirectory()).map(e=>`explore/${e.name}/index.html`)]) {
   const html=fs.readFileSync(`${root}/${page}`,'utf8');
   assert.ok((html.match(/data-career=/g)||[]).length<=9,page);
   assert.ok(html.includes('data-search'),page);
 }
 for(const c of index) {
   assert.ok(!('scenes' in c));
   assert.ok(fs.existsSync(`${root}/catalog/cards/${c.slug}/index.html`));
 }
});
