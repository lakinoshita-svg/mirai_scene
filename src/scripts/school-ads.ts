import { selectSchoolAds } from '../lib/select-school-ads.mjs';
import { createRegionResolver } from '../lib/ad-region.mjs';
let storage: Storage | undefined;
try { storage = window.sessionStorage; } catch { /* 保存を拒否していても利用可能 */ }
const resolver = createRegionResolver({ storage, endpoint: import.meta.env.PUBLIC_REGION_API_URL || '' });
const slots: Array<() => Promise<void>> = [];
document.querySelectorAll<HTMLElement>('[data-ad-category]').forEach(slot => {
    const category = slot.dataset.adCategory!;
    const cards = [...slot.querySelectorAll<HTMLAnchorElement>('[data-ad-id]')];
    const select = slot.querySelector<HTMLSelectElement>('[data-ad-region]')!;
    const ads = cards.map(card => ({ id: card.dataset.adId!, enabled: true, targetRegions: card.dataset.adRegions!.split(' ') }));
    const config = { ads, categoryAds: { [category]: ads.map(ad => ad.id) } };
    const render = () => {
        const visible = new Set(selectSchoolAds(category, config, select.value).map(ad => ad.id));
        cards.forEach(card => card.hidden = !visible.has(card.dataset.adId!));
        slot.querySelector<HTMLElement>('[data-ad-empty]')!.hidden = visible.size > 0;
    };
    const update = async () => {
        const result = await resolver.resolve();
        select.value = result.region;
        render();
        const status = slot.querySelector<HTMLElement>('[data-ad-region-status]')!;
        const label = select.selectedOptions[0].text;
        const hasRegional = ads.some(ad => ad.targetRegions.includes(select.value));
        status.textContent = result.source === 'estimated'
            ? `学校を探すエリア：${label}（IPアドレスからの目安・変更できます）`
            : `学校を探すエリア：${label}`;
        if (select.value !== 'all' && !hasRegional) status.textContent += '。このエリアの広告がないため、全国向けの掲載情報を表示します。';
    };
    slots.push(update);
    select.closest<HTMLElement>('label')!.hidden = false;
    select.addEventListener('change', () => {
        resolver.choose(select.value);
        slots.forEach(refresh => void refresh());
    });
    render();
    void update();
});
