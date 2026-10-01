// データ読込と独立させ、列構成や見た目の変更をここへ集約する。
const REVIEW_COLUMNS = ['確認状況', '修正希望・理由', '確認者', '確認日（年月日）', 'JSON内の位置'];
const REVIEW_STATUSES = ['未確認', '確認中', '修正依頼', '確認済み'];
const HEADER_ROW = 4;

export function createReviewWorkbook(Workbook, {careers, rows, configs}, createdAt) {
  const workbook = Workbook.create();
  const dateLabel = new Intl.DateTimeFormat('sv-SE', {timeZone: 'Asia/Tokyo'}).format(createdAt);
  const definitions = [
    {
      name: '確認対象一覧',
      headers: ['コンテンツID', '職業名', '分野', 'カード見出し', 'シーン数', '原稿状態'],
      data: careers.map(c => [c.slug, c.name, c.category, c.entryTitle, c.scenes.length, c.reviewStatus]),
      widths: [24, 28, 18, 48, 12, 24],
    },
    {
      name: '原稿確認',
      headers: ['コンテンツID', '場面・選択肢', '項目', '原文', ...REVIEW_COLUMNS],
      data: rows, widths: [23, 48, 24, 80, 15, 60, 20, 20, 42], review: true,
    },
    {
      name: '連携設定確認',
      headers: ['設定ファイル', '対象', '項目', '設定値', ...REVIEW_COLUMNS],
      data: configs, widths: [25, 40, 24, 70, 15, 60, 20, 20, 42], review: true,
    },
  ];
  definitions.forEach((definition, index) => addSheet(workbook, definition, dateLabel, index));
  return {
    workbook,
    previews: definitions.map(({name, data}) => ({name, range: `A4:F${Math.min(7, data.length + HEADER_ROW)}`})),
  };
}

function columnName(index) {
  let name = '';
  for (index++; index; index = Math.floor((index - 1) / 26)) {
    name = String.fromCharCode(65 + (index - 1) % 26) + name;
  }
  return name;
}

function addSheet(workbook, {name, headers, data, widths, review}, dateLabel, index) {
  const sheet = workbook.worksheets.add(name);
  const end = columnName(headers.length - 1);
  const last = data.length + HEADER_ROW;
  sheet.showGridLines = false;
  sheet.getRange('A1').values = [[`${name}　${dateLabel} 出力`]];
  sheet.getRange('A2').values = [[review
    ? '黄色欄へ確認結果を記入。原文・IDは変更しない。'
    : '担当するコンテンツIDを確認し、原稿確認シートで絞り込んでください。']];
  sheet.getRange(`A4:${end}${last}`).values = [headers, ...data];
  sheet.getRange(`A1:${end}${last}`).format.font = {name: 'Yu Gothic', size: 11, color: '#30283e'};
  const tableRange = sheet.getRange(`A4:${end}${last}`);
  tableRange.format.wrapText = true;
  tableRange.format.verticalAlignment = 'top';
  sheet.getRange(`A4:${end}4`).format = {
    fill: '#594378', font: {color: '#ffffff', bold: true}, rowHeight: 30,
  };
  widths.forEach((width, i) => {
    sheet.getRange(`${columnName(i)}4:${columnName(i)}${last}`).format.columnWidth = width;
  });
  // 日本語の折り返しを考慮。長い解説を固定高で切らず、内容に応じて行高を設定する。
  data.forEach((row, i) => {
    const lines = Math.max(...row.map((value, j) =>
      Math.ceil(String(value ?? '').length / Math.max(6, widths[j] * .48))));
    sheet.getRange(`A${i + 5}:${end}${i + 5}`).format.rowHeight = Math.max(42, lines * 16 + 12);
  });
  sheet.tables.add(`A4:${end}${last}`, true, `Review${index + 1}`);
  if (review && data.length) {
    sheet.getRange(`E5:H${last}`).format.fill = '#fff3cd';
    sheet.getRange(`E5:E${last}`).dataValidation = {rule: {type: 'list', values: REVIEW_STATUSES}};
  }
  sheet.freezePanes.freezeRows(HEADER_ROW);
}
