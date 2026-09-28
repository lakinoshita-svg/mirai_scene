import { registerTools } from './webmcp';
import { sitePath } from '../lib/paths';
const DEFAULT_LABEL = 'いろいろな仕事のひと場面';
const HERO_LABELS: Record<string, string> = { make: 'つくる', support: '支える', convey: '伝える' };
const CONVEY_CAREERS = new Set(['childcare', 'editor', 'video-producer', 'event-planner', 'librarian', 'museum-curator']);
const root = document.querySelector<HTMLElement>('[data-catalog]');
if (root) {
    const cards = [...root.querySelectorAll<HTMLAnchorElement>('[data-career]')];
    const interests = [...root.querySelectorAll<HTMLButtonElement>('[data-interest]')];
    const categories = [...root.querySelectorAll<HTMLButtonElement>('[data-category-filter]')];
    const mobile = matchMedia('(max-width: 650px)');
    const more = root.querySelector<HTMLButtonElement>('[data-more]')!;
    const moreContainer = root.querySelector<HTMLElement>('[data-more-container]')!;
    const visibleCount = root.querySelector<HTMLElement>('[data-visible-count]')!;
    const countLabel = root.querySelector<HTMLElement>('[data-count-label]')!;
    const count = root.querySelector<HTMLElement>('[data-count]')!;
    let matching = cards;
    let limit = mobile.matches ? 8 : 9;
    const pageSize = () => mobile.matches ? 8 : 9;
    function render() {
        const visible = matching.slice(0, limit);
        cards.forEach(card => card.hidden = !visible.includes(card));
        more.hidden = visible.length >= matching.length;
        moreContainer.hidden = false;
        visibleCount.textContent = `全${matching.length}件中 ${visible.length}件を表示`;
    }
    more.addEventListener('click', () => {
        const firstNew = matching[limit];
        limit += pageSize();
        render();
        firstNew?.focus({ preventScroll: true });
    });
    mobile.addEventListener('change', () => { limit = pageSize(); render(); });
    root.querySelector<HTMLElement>('.catalog-controls')!.hidden = false;
    function filter(interest: string, category: string, label: string) {
        matching = cards.filter(card => {
            const matchesInterest = interest === 'convey'
                ? CONVEY_CAREERS.has(card.dataset.career!)
                : interest === 'all' || card.dataset.cardTheme === interest;
            return matchesInterest && (category === 'すべて' || card.dataset.category === category);
        });
        limit = pageSize();
        render();
        interests.forEach(b => { const selected = b.dataset.interest === interest; b.classList.toggle('active', selected); b.setAttribute('aria-pressed', String(selected)); });
        categories.forEach(b => { const selected = b.dataset.categoryFilter === category; b.classList.toggle('active', selected); b.setAttribute('aria-pressed', String(selected)); });
        countLabel.textContent = label;
        count.textContent = `${matching.length}件`;
    }
    interests.forEach(b => b.addEventListener('click', () => filter(b.dataset.interest!, 'すべて', b.dataset.interest === 'all' ? DEFAULT_LABEL : `${b.textContent}につながるひと場面`)));
    categories.forEach(b => b.addEventListener('click', () => filter('all', b.dataset.categoryFilter!, b.dataset.categoryFilter === 'すべて' ? DEFAULT_LABEL : b.dataset.categoryFilter!)));
    root.querySelectorAll<HTMLAnchorElement>('[data-hero-interest]').forEach(link => link.addEventListener('click', () => {
        const interest = link.dataset.heroInterest!;
        filter(interest, 'すべて', interest === 'all' ? DEFAULT_LABEL : `${HERO_LABELS[interest]}につながるひと場面`);
        root!.querySelector<HTMLElement>('#experiences')?.focus({ preventScroll: true });
    }));
    render();
    root.dataset.ready = 'true';
    // Preserve links shared from the original hash-routed prototype.
    let legacy = '';
    try {
        legacy = decodeURIComponent(location.hash.slice(1));
    }
    catch { /* Ignore malformed legacy links. */ }
    if (legacy === 'about')
        location.replace(sitePath('about/'));
    else if (legacy.startsWith('career/')) {
        const card = cards.find(c => c.dataset.career === legacy.slice(7));
        if (card)
            location.replace(card.href);
    }
    registerTools([
        { name: 'list_careers', description: 'List available career experiences.', inputSchema: { type: 'object', properties: {}, additionalProperties: false }, annotations: { readOnlyHint: true }, execute: () => cards.map(c => ({ id: c.dataset.career, name: c.dataset.name, category: c.dataset.category })) },
        { name: 'open_career', description: 'Navigate to a career experience.', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'], additionalProperties: false }, annotations: { readOnlyHint: false }, execute: input => {
                const id = (input as {
                    id?: unknown;
                })?.id;
                const card = typeof id === 'string' ? cards.find(c => c.dataset.career === id) : undefined;
                if (!card)
                    return { error: 'Unknown career ID' };
                location.assign(card.href);
                return { navigatingTo: card.href };
            } },
    ]);
}
