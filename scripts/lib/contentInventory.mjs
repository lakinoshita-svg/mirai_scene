import fs from 'node:fs';
import path from 'node:path';
import { loadManuscriptDirectory, loadDraftBatch } from './draftBatch.mjs';
import { verifyEditorialReview } from './editorialReview.mjs';
import { escapeHtml, renderDraftDocuments } from './draftReviewDocuments.mjs';

const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const uniqueCount = rows => new Set(rows.map(row => row.id)).size;

function checkBatchDocuments(batchId, root) {
  const directory = path.join(root, 'drafts', batchId);
  const issues = [];
  let recordStatus = '記録なし';
  const record = path.join(directory, 'review/occupationChecks.json');
  if (fs.existsSync(record)) {
    try {
      const batch = verifyEditorialReview(batchId, root);
      recordStatus = '原稿と一致';
      const documents = renderDraftDocuments(batch);
      for (const [file, expected] of Object.entries(documents)) {
        const target = path.join(directory, file);
        if (fs.existsSync(target) && fs.readFileSync(target, 'utf8').replaceAll('\r\n', '\n') !== expected) {
          issues.push({ target: `drafts/${batchId}/${file}`, message: '現在の原稿・確認記録から生成した内容と一致しません。' });
        }
      }
    } catch (error) {
      recordStatus = '要確認';
      issues.push({ target: `drafts/${batchId}/review/occupationChecks.json`, message: error.message });
    }
  } else {
    issues.push({ target: `drafts/${batchId}`, message: '二段階・回答別の統合確認記録がありません。確認済みとは扱いません。' });
  }
  const required = ['README.md', 'REVIEW.md', 'manuscript.html', 'review/occupationChecks.md', 'review/answerChecks.md'];
  // 出典をREVIEW.md内で説明するバッチもあるため、別ファイルは参照がある場合に照合する。
  for (const file of ['README.md', 'REVIEW.md']) {
    const target = path.join(directory, file);
    if (fs.existsSync(target) && /\]\((?:\.\/)?review\/sourceEvidence\.md\)/.test(fs.readFileSync(target, 'utf8'))) {
      if (!required.includes('review/sourceEvidence.md')) required.push('review/sourceEvidence.md');
    }
  }
  const missingDocuments = required.filter(file => !fs.existsSync(path.join(directory, file)));
  if (missingDocuments.length) issues.push({ target: `drafts/${batchId}`, message: `確認資料がありません: ${missingDocuments.join('、')}` });
  return { batchId, recordStatus, missingDocuments, issues };
}

function summarizeGroups(rows, key) {
  return [...Map.groupBy(rows, row => row[key])].map(([name, items]) => ({
    name,
    experiences: uniqueCount(items),
    published: uniqueCount(items.filter(row => row.stage === 'published')),
    drafts: uniqueCount(items.filter(row => row.stage === 'draft')),
    preview: uniqueCount(items.filter(row => row.inPreview)),
  })).sort((a, b) => b.experiences - a.experiences || a.name.localeCompare(b.name, 'ja'));
}

// 読み取りと集計には書き込みを含めない。公開承認・配布・掲載状態は推測しない。
export function collectContentInventory(root = process.cwd(), asOf = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' }).format(new Date())) {
  const operations = readJson(path.join(root, 'config/contentOperations.json'));
  const approvals = readJson(path.join(root, 'config/publicationApprovals.json'));
  const { batches: previewBatches } = readJson(path.join(root, 'config/preview.json'));
  const draftRoot = path.join(root, 'drafts');
  const batchIds = fs.existsSync(draftRoot) ? fs.readdirSync(draftRoot, { withFileTypes: true })
    .filter(item => item.isDirectory() && /^batch-\d+$/.test(item.name)).map(item => item.name).sort() : [];
  const issues = [];
  const validPreview = Array.isArray(previewBatches) && previewBatches.length > 0 && new Set(previewBatches).size === previewBatches.length && previewBatches.every(id => batchIds.includes(id));
  if (!validPreview) issues.push({ target: 'config/preview.json', message: 'プレビュー対象に重複・存在しないバッチ、または形式の誤りがあります。' });
  const batches = batchIds.map(batchId => checkBatchDocuments(batchId, root));
  issues.push(...batches.flatMap(batch => batch.issues));
  const collections = [
    { stage: 'published', batchId: null, entries: loadManuscriptDirectory(path.join(root, 'src/content/careers')) },
    ...batchIds.map(batchId => ({ stage: 'draft', batchId, entries: loadDraftBatch(batchId, root).entries })),
  ];
  const rows = collections.flatMap(({ stage, batchId, entries }) => entries.map(({ manuscript: c, sha256, sourcePath }) => {
    const op = operations.contents[c.slug] || {};
    const approval = approvals[c.slug];
    return {
      id: c.slug, name: c.name, title: c.entryTitle, theme: c.cardTheme, category: c.category, order: c.order,
      source: path.relative(root, sourcePath).split(path.sep).join('/'), sha256, stage, batchId,
      inPreview: validPreview && (stage === 'published' || previewBatches.includes(batchId)),
      review: c.reviewStatus, referenceDate: c.reference?.checkedAt,
      owner: op.owner || '未設定', reviewDueAt: op.reviewDueAt || '未設定', reviewDue: !!op.reviewDueAt && op.reviewDueAt <= asOf,
      publication: approval?.sha256 === sha256 && approval.approvedBy && approval.approvedAt && approval.scope ? '承認記録あり' : '承認記録なし',
      deployedRelease: op.deployedRelease || '未記録',
    };
  }));
  // 同じslugの公開元・下書きを二つの体験として数えない。ただし重複自体は隠さない。
  for (const [id, items] of Map.groupBy(rows, row => row.id)) {
    if (items.length > 1) issues.push({ target: id, message: `同じ体験IDが複数箇所にあります: ${items.map(item => item.source).join('、')}` });
  }
  for (const [order, items] of Map.groupBy(rows, row => row.order)) {
    if (uniqueCount(items) > 1) issues.push({ target: `order=${order}`, message: `掲載順が重複しています: ${items.map(item => item.id).join('、')}` });
  }
  const previewRows = rows.filter(row => row.inPreview);
  const previewCanBuild = validPreview && uniqueCount(previewRows) === previewRows.length;
  if (validPreview && !previewCanBuild) issues.push({ target: 'config/preview.json', message: '対象の体験IDが衝突するため、プレビューをビルドできません。' });
  const occupations = summarizeGroups(rows, 'name');
  const categories = summarizeGroups(rows, 'category');
  const themes = summarizeGroups(rows, 'theme');
  const summary = {
    experiences: uniqueCount(rows), occupations: occupations.length, categories: categories.length,
    published: uniqueCount(rows.filter(row => row.stage === 'published')),
    drafts: uniqueCount(rows.filter(row => row.stage === 'draft')),
    preview: previewCanBuild ? uniqueCount(previewRows) : null, files: rows.length,
  };
  const ads = readJson(path.join(root, 'src/data/schoolAds.json')).ads.map(ad => ({ ...ad, ...operations.ads[ad.id] }));
  return { asOf, summary, occupations, categories, themes, batches, issues, rows, ads };
}

const esc = value => escapeHtml(value ?? '');
function renderTable(headers, rows, rowClasses = []) {
  return `<div class="tableWrap"><table><thead><tr>${headers.map(label => `<th scope="col">${esc(label)}</th>`).join('')}</tr></thead><tbody>${rows.map((row, index) => `<tr class="${esc(rowClasses[index])}">${row.map(value => `<td>${esc(value)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

export function renderContentInventory(inventory) {
  const { asOf, summary: s, occupations, categories, themes, batches, issues, rows, ads } = inventory;
  const columns = ['id', 'name', 'title', 'category', 'theme', 'source', 'owner', 'review', 'referenceDate', 'reviewDueAt', 'publication', 'deployedRelease'];
  const groupTable = (label, groups) => `<h2>${label}ごとの体験数</h2>${renderTable([label, '合計', '公開元', '下書き', 'プレビュー設定'], groups.map(group => [group.name, group.experiences, group.published, group.drafts, group.preview]))}`;
  return `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>ミライシーン 運営一覧</title><style>body{font:15px/1.7 system-ui;margin:24px;color:#30283e}h2{margin-top:32px}table{border-collapse:collapse}th,td{border:1px solid #ded2ef;padding:8px;text-align:left;min-width:96px}th{background:#f4f0f7}td{vertical-align:top}.tableWrap{overflow:auto}.due{background:#fff4de}li{margin-bottom:8px}</style></head><body><main>
<h1>ミライシーン 運営一覧</h1><p>集計日 ${esc(asOf)} ／ <strong>${s.experiences}体験・${s.occupations}職種・${s.categories}分野</strong>（原稿${s.files}ファイル）</p>
<p>公開元 ${s.published}体験 ／ 下書き ${s.drafts}体験 ／ プレビュー設定 ${s.preview ?? '要確認'}体験</p>
<p>体験数はslug、職種数はname、分野数はcategoryの種類数です。同じ職種の複数題材を別の職種として数えません。公開元・プレビュー設定は実際の公開状況や承認を表しません。重複IDがある場合、合計は重複を除き、保管場所別の数は重なります。</p>
<h2>確認が必要な項目</h2><ul>${issues.map(issue => `<li>${esc(issue.target)}：${esc(issue.message)}</li>`).join('') || '<li>ファイルの照合で検出された項目はありません。</li>'}</ul>
<p>記録の一致は内容の正しさ・実務監修・公開承認の証明ではありません。確認資料は <code>npm run content:export-drafts -- batch-NNN</code> で生成します。原稿と記録が食い違う場合は、先に内容を再確認してください。</p>
${renderTable(['バッチ', '確認記録', '不足する資料'], batches.map(batch => [batch.batchId, batch.recordStatus, batch.missingDocuments.join('、') || 'なし']))}
${groupTable('職種', occupations)}${groupTable('分野', categories)}${groupTable('テーマ', themes)}
<h2>原稿と運営情報</h2><p>担当・再確認予定・導入済み版は config/contentOperations.json に記録します。公開承認は対象原稿のハッシュと照合します。</p>
${renderTable(['ID', '職業名', '題材', '分野', 'テーマ', '原稿の場所', '担当', '編集状態', '資料確認日', '再確認予定', '公開承認', '導入済み版'], rows.map(row => columns.map(key => row[key])), rows.map(row => row.reviewDue ? 'due' : ''))}
<h2>次の題材を考える</h2><p>同じ職業でも題材・相手・制約を比較してください。職種数の少なさと同職種内の体験数の少なさを分け、件数だけで制作優先度を自動決定しません。</p>
<h2>広告の掲載確認</h2><p>掲載終了日は自動非表示の設定ではありません。期限前に enabled を設定し、ビルド・配布・導入します。</p><ul>${ads.map(ad => `<li>${esc(ad.id)} ／ 担当 ${esc(ad.owner || '未設定')} ／ 掲載終了 ${esc(ad.endsAt || '未設定')}</li>`).join('') || '<li>登録広告なし</li>'}</ul>
</main></body></html>\n`;
}

export function buildContentInventory(root = process.cwd(), asOf) {
  const inventory = collectContentInventory(root, asOf);
  const directory = path.join(root, 'outputs/operations');
  fs.mkdirSync(directory, { recursive: true });
  const output = path.join(directory, 'contentInventory.html');
  fs.writeFileSync(output, renderContentInventory(inventory));
  fs.writeFileSync(path.join(directory, 'contentInventory.json'), JSON.stringify(inventory, null, 2) + '\n');
  return { inventory, output };
}
