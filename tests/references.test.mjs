import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
test('Source guidance is consolidated on about without interrupting scenes', () => {
 const output=process.env.TEST_DIST || 'dist';
 const about=fs.readFileSync(path.join(output,'about/index.html'),'utf8');
 for(const url of ['https://shinronavi.com/forteacher/uni_lesson_list','https://shinronavi.com/forteacher/voc_lesson_list','https://shigoto.mhlw.go.jp/']) assert.ok(about.includes(url));
 for(const file of fs.readdirSync('src/content/careers').filter(f=>f.endsWith('.json'))){
 const c=JSON.parse(fs.readFileSync(`src/content/careers/${file}`,'utf8'));
 const html=fs.readFileSync(path.join(output,'careers',c.slug,'index.html'),'utf8');
 for(const removed of ['scene-evidence','仕事の背景を確認した資料','資料確認日：','専門家によるシーン監修：']) assert.ok(!html.includes(removed),c.slug);
 assert.ok(c.reference.url);
 }
});
