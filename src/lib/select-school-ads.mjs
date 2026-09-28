/** @template {{id: string, enabled: boolean, targetRegions: string[]}} T
 * @param {string} category
 * @param {{ads: T[], categoryAds: Record<string, string[]>}} config
 * @param {string | undefined} [region]
 * @returns {T[]}
 */
export function selectSchoolAds(category, config, region) {
  const candidates = getCategoryAds(category, config);
  const regional = region && region !== 'all'
    ? candidates.filter(ad => ad.targetRegions.includes(region)) : [];
  return regional.length ? regional : candidates.filter(ad => ad.targetRegions.includes('all'));
}

/** @template {{id: string, enabled: boolean}} T
 * @param {string} category
 * @param {{ads: T[], categoryAds: Record<string, string[]>}} config
 * @returns {T[]}
 */
export function getCategoryAds(category, config) {
  const ads = new Map(config.ads.map(ad => [ad.id, ad]));
  return (config.categoryAds[category] ?? []).flatMap(id => {
    const ad = ads.get(id);
    return ad?.enabled ? [ad] : [];
  });
}
