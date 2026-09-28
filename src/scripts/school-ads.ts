import { selectSchoolAds } from '../lib/select-school-ads.mjs';
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
    try {
        const saved = sessionStorage.getItem('mirai-ad-region');
        if (saved && [...select.options].some(option => option.value === saved))
            select.value = saved;
    }
    catch { /* Selection still works when browser storage is unavailable. */ }
    select.closest<HTMLElement>('label')!.hidden = false;
    select.addEventListener('change', () => {
        render();
        try {
            sessionStorage.setItem('mirai-ad-region', select.value);
        }
        catch { /* Optional session persistence. */ }
    });
    render();
});
