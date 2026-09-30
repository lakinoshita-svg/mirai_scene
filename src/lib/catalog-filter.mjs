const normalize = value => value.normalize('NFKC').toLocaleLowerCase('ja').trim();
// 検索は空白区切りのAND検索。画像テーマと興味フィルターは同じ分類を使う。
export function filterCatalog(items, { learning = '', interest = 'all', category = 'すべて', query = '' } = {}) {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  return items.filter(item => (!learning || item.learningIds.includes(learning)) &&
    (interest === 'all' || item.cardTheme === interest) &&
    (category === 'すべて' || item.category === category) &&
    words.every(word => normalize(`${item.name} ${item.category} ${item.entryTitle} ${item.description}`).includes(word)));
}
