import fs from 'node:fs';
import path from 'node:path';
import { verifyEditorialReview } from './editorialReview.mjs';

const stylesheet = fs.readFileSync(new URL('../templates/draftManuscript.css', import.meta.url), 'utf8');
const briefLabels = { role: '役割', audience: '相手', goal: '目的', constraint: '条件' };
const htmlEntities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const escapeHtml = value => String(value).replace(/[&<>"']/g, character => htmlEntities[character]);
const tableCell = value => String(value).replaceAll('|', '&#124;').replace(/\r?\n/g, '<br>');

function renderOption(option, index) {
  return `<div class="option">
    <h4>${'ABC'[index]}．${escapeHtml(option.label)}</h4>
    <p>${escapeHtml(option.explanation)}</p>
    <p><strong>期待できること：</strong>${escapeHtml(option.benefit)}</p>
    <p><strong>懸念点・確認すること：</strong>${escapeHtml(option.caution)}</p>
  </div>`;
}

function renderScene(scene, index) {
  return `<section>
    <p class="eyebrow">SCENE ${index + 1} / 3 · ${escapeHtml(scene.id)}</p>
    <h3>${escapeHtml(scene.title)}</h3>
    <p>${escapeHtml(scene.situation)}</p>
    <h4>${escapeHtml(scene.question)}</h4>
    <aside><strong>共通解説・状況の整理</strong><p>${escapeHtml(scene.contextExplanation)}</p></aside>
    ${scene.options.map(renderOption).join('\n')}
    <p><strong>仕事の視点：</strong>${escapeHtml(scene.perspective)}</p>
    <p><strong>仕事とのつながり：</strong>${escapeHtml(scene.workConnection)}</p>
    <div class="reflection"><strong>感想ボタン：${escapeHtml(scene.insight)}</strong><p>${escapeHtml(scene.reflectionResponse)}</p></div>
  </section>`;
}

function renderManuscript(manuscript) {
  const brief = manuscript.brief
    ? `<dl>${Object.entries(manuscript.brief).map(([key, value]) => `<dt>${briefLabels[key] || escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd>`).join('')}</dl>`
    : '';
  return `<article id="${escapeHtml(manuscript.slug)}">
    <p class="eyebrow">${escapeHtml(manuscript.category)} ／ ${escapeHtml(manuscript.name)} ／ ${escapeHtml(manuscript.slug)}</p>
    <h2>${escapeHtml(manuscript.entryTitle)}</h2>
    <p>${escapeHtml(manuscript.description)}</p>
    ${manuscript.mission ? `<p><strong>ミッション：</strong>${escapeHtml(manuscript.mission)}</p>` : ''}
    ${brief}
    ${manuscript.scenes.map(renderScene).join('\n')}
    <p><strong>学びとのつながり：</strong>${escapeHtml(manuscript.learning)}</p>
    <p><a href="${escapeHtml(manuscript.reference.url)}">${escapeHtml(manuscript.reference.publisher)}「${escapeHtml(manuscript.reference.title)}」</a>（本文確認：${escapeHtml(manuscript.reference.checkedAt)}）</p>
    <p><a href="#contents">原稿一覧へ戻る</a></p>
  </article>`;
}

export function renderDraftManuscript(batch) {
  const { batchId, manuscripts, counts } = batch;
  const navigation = manuscripts.map(manuscript => `<li><a href="#${escapeHtml(manuscript.slug)}">${escapeHtml(manuscript.name)}：${escapeHtml(manuscript.entryTitle)}</a></li>`).join('\n');
  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>ミライシーン ${escapeHtml(batchId)} 原稿一覧</title>
  <style>${stylesheet}</style>
</head>
<body><main>
  <h1>ミライシーン：${counts.experiences}体験の原稿一覧</h1>
  <p>${escapeHtml(batchId)} ／ 二段階の確認記録あり ／ ${counts.scenes}シーン・${counts.options}選択肢</p>
  <p>JSONから作成した閲覧用資料です。利用者向けの公開ページではありません。各案に正解・不正解を付けず、期待できることと残る課題を比較します。資料確認・自己レビューと、実務経験者の確認・公開承認は別です。</p>
  <p><a href="./REVIEW.md">出典と確認記録</a> ／ <a href="./review/occupationChecks.md">職種と内容の二段階チェック</a> ／ <a href="./review/answerChecks.md">回答ごとの確認理由</a></p>
  <nav id="contents" aria-label="原稿一覧"><ol>${navigation}</ol></nav>
  ${manuscripts.map(renderManuscript).join('\n')}
</main></body>
</html>\n`;
}

function reviewIntroduction(batch) {
  const { batchId, counts, report } = batch;
  return `# 職種と回答の確認

対象：${batchId}の${counts.experiences}体験・${counts.scenes}シーン・${counts.options}案。

| 確認 | 担当 | 日付 | 方法 |
|---|---|---|---|
${['occupational', 'editorial'].map(stage => {
    const pass = report.passes[stage];
    return `| ${stage === 'occupational' ? '職種・業務' : '原稿・回答'} | ${tableCell(pass.reviewer)} | ${tableCell(pass.checkedAt)} | ${tableCell(pass.method)} |`;
  }).join('\n')}

「適合」は教材の条件下で説明が対応するという編集判断です。唯一の正解・効果の実証・実務監修・公開承認を表すものではありません。
`;
}

export function renderAnswerChecks(batch) {
  const entries = new Map(batch.report.entries.map(entry => [entry.slug, entry]));
  const sections = batch.manuscripts.map(manuscript => {
    const entry = entries.get(manuscript.slug);
    const scenes = manuscript.scenes.map(scene => {
      const check = entry.scenes.find(item => item.sceneId === scene.id);
      const reasons = new Map(check.optionChecks.map(item => [item.optionId, item.reason]));
      return `### ${scene.id}：${scene.title}

問い：${scene.question}

| 回答 | 判定 | 確認した内容・成立条件 |
|---|---|---|
${scene.options.map(option => `| ${option.id}：${tableCell(option.label)} | 適合 | ${tableCell(reasons.get(option.id))} |`).join('\n')}`;
    });
    return `## ${manuscript.name}：${manuscript.entryTitle}\n\n${scenes.join('\n\n')}`;
  });
  return `${reviewIntroduction(batch)}\n${sections.join('\n\n')}\n\n業務資料と独自設定の範囲は[資料・確認記録](../REVIEW.md)を参照してください。\n`;
}

export function renderOccupationChecks(batch) {
  const rows = batch.report.entries.flatMap(entry => entry.scenes.map(scene =>
    `| ${tableCell(entry.slug)} / ${tableCell(scene.sceneId)} | ${tableCell(scene.occupational.reason)} | ${tableCell(scene.editorial.reason)} |`));
  return `${reviewIntroduction(batch)}
| 体験／シーン | 職種と業務の対応（適合） | 内容と回答の対応（適合） |
|---|---|---|
${rows.join('\n')}

各案の理由は[回答確認表](answerChecks.md)、対象原稿のSHA-256と判定はoccupationChecks.jsonに保持します。\n`;
}

// 判定理由は生成しない。人・AIが原稿を読んで記録した確認結果を、原稿の表示文と対応させる。
export function exportDraftDocuments(batchId, root = process.cwd()) {
  const batch = verifyEditorialReview(batchId, root);
  const documents = {
    'manuscript.html': renderDraftManuscript(batch),
    'review/answerChecks.md': renderAnswerChecks(batch),
    'review/occupationChecks.md': renderOccupationChecks(batch),
  };
  for (const [relativePath, body] of Object.entries(documents)) fs.writeFileSync(path.join(batch.directory, relativePath), body);
  return { ...batch, documents: Object.keys(documents) };
}
