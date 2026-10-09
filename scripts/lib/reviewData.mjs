import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
const names = {slug:'コンテンツID',name:'職業名',category:'分野',entryTitle:'カード見出し',description:'説明',cardTheme:'カードテーマ',order:'表示順',estimatedMinutes:'目安時間',reviewStatus:'原稿状態',mission:'ミッション',role:'役割',audience:'相手',goal:'目的',constraint:'制約',learning:'学びの説明',title:'見出し',situation:'状況',question:'問い',contextExplanation:'共通解説・状況整理',label:'表示文',explanation:'選択の説明',benefit:'良いこと',caution:'懸念点',perspective:'考える視点',insight:'気づき',workConnection:'業務との関連',src:'画像パス',alt:'画像の説明',caption:'画像見出し',publisher:'発行元',url:'URL',checkedAt:'資料確認日',background:'業務の背景'};

names.reflectionResponse = '体験後の振り返り文';

// JSON Pointerを保持し、レビューの行を原稿の項目へ確実に対応させる。
export function flatten(value, pointer, context, result, base) {
  if (value !== null && typeof value === 'object' && Object.keys(value).length) {
    for (const [key, child] of Object.entries(value)) {
      let nextContext = context;
      if (Array.isArray(value)) {
        nextContext += ` / ${child?.id || Number(key) + 1}`;
      } else {
        const section = {scenes: 'シーン', options: '選択肢', comparison: '比較画像'}[key];
        if (section) nextContext += ' / ' + section;
      }
      const escapedKey = key.replace(/~/g, '~0').replace(/\//g, '~1');
      flatten(child, pointer + '/' + escapedKey, nextContext, result, base);
    }
    return;
  }
  // 空配列・空オブジェクトも「設定なし」として残し、0・falseを空欄にしない。
  const key = pointer.split('/').at(-1);
  const cellValue = value !== null && typeof value === 'object' ? JSON.stringify(value) : value;
  result.push([base, context, names[key] || key, cellValue, '未確認', '', '', '', pointer]);
}

export async function loadReviewData(root) {
  const sources = [];
  async function read(relativePath) {
    const raw = await fs.readFile(path.join(root, relativePath), 'utf8');
    sources.push({file: relativePath, sha256: crypto.createHash('sha256').update(raw).digest('hex')});
    return JSON.parse(raw);
  }
  async function files(directory) {
    return (await fs.readdir(path.join(root, directory))).filter(file => file.endsWith('.json')).sort();
  }
  const careers = [];
  for (const file of await files('src/content/careers')) careers.push(await read('src/content/careers/' + file));
  careers.sort((a,b) => a.order - b.order || a.slug.localeCompare(b.slug));
  const rows = [], configs = [];
  for (const career of careers) flatten(career, '', career.name, rows, career.slug);
  for (const file of await files('src/data')) flatten(await read('src/data/' + file), '', file, configs, file);
  return {careers, rows, configs, sources};
}
