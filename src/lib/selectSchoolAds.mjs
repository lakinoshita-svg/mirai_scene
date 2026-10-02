/** @template {{id: string, enabled: boolean, targetRegions: string[]}} T
 * @param {string} category
 * @param {{ads: T[], categoryAds: Record<string, string[]>}} config
 * @param {string | undefined} [region]
 * @returns {T[]}
 */
export function selectSchoolAds(category, config, region) {
  // 職業名ではなくカテゴリー単位で広告を共有する。同一職業の設問追加で広告設定を増やさない。
  const candidates = getCategoryAds(category, config);
  const regional = region && region !== 'all'
    ? candidates.filter(ad => ad.targetRegions.includes(region)) : [];
  // 地域広告があればそれだけ表示。未選択・該当なしは全国向けへ戻し、無関係な地域を出さない。
  return regional.length ? regional : candidates.filter(ad => ad.targetRegions.includes('all'));
}

/** @template {{id: string, enabled: boolean}} T
 * @param {string} category
 * @param {{ads: T[], categoryAds: Record<string, string[]>}} config
 * @returns {T[]}
 */
export function getCategoryAds(category, config) {
  const ads = new Map(config.ads.map(ad => [ad.id, ad]));
  // 配列の順番が掲載順。無効化された広告は全カテゴリーから除外する。
  return (config.categoryAds[category] ?? []).flatMap(id => {
    const ad = ads.get(id);
    return ad?.enabled ? [ad] : [];
  });
}
