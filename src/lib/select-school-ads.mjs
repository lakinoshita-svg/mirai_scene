/** @template {{id: string, enabled: boolean}} T
 * @param {string} category
 * @param {{ads: T[], categoryAds: Record<string, string[]>}} config
 * @returns {T[]}
 */
export function selectSchoolAds(category, config) {
  const ads = new Map(config.ads.map(ad => [ad.id, ad]));
  return (config.categoryAds[category] ?? []).flatMap(id => {
    const ad = ads.get(id);
    return ad?.enabled ? [ad] : [];
  });
}
