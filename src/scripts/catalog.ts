import { sitePath, careerPath } from '../lib/paths';
import { registerTools } from './webmcp';
import { filterCatalog } from '../lib/catalog-filter.mjs';
interface Entry { slug: string; name: string; category: string; cardTheme: string; entryTitle: string; description: string; learningIds: string[] }
document.querySelectorAll<HTMLElement>('[data-catalog]').forEach(root => {
  const grid = root.querySelector<HTMLElement>('#career-grid')!;
  const more = root.querySelector<HTMLButtonElement>('[data-more]')!;
  const retry = root.querySelector<HTMLButtonElement>('[data-retry]')!;
  const status = root.querySelector<HTMLElement>('[data-catalog-status]')!;
  const search = root.querySelector<HTMLInputElement>('[data-search]')!;
  const mobile = matchMedia('(max-width: 650px)');
  const pageSize = () => mobile.matches ? 8 : 9;
  const cache = new Map<string, HTMLElement>();
  grid.querySelectorAll<HTMLElement>('[data-career]').forEach(card => cache.set(card.dataset.career!, card));
  let entries: Entry[] = [];
  let interest = 'all', category = 'すべて', limit = pageSize(), revision = 0;
  let loaded = false;
  // 最初の9枚以外は必要時に取得。SSRと追加分は同じCareerCardで生成する。
  async function cardFor(entry: Entry) {
    if (cache.has(entry.slug)) return cache.get(entry.slug)!;
    const response = await fetch(`${root.dataset.cardBase}${encodeURIComponent(entry.slug)}/`, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error('Card unavailable');
    const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
    const card = doc.querySelector<HTMLElement>('[data-career]');
    if (!card || card.dataset.career !== entry.slug) throw new Error('Invalid card');
    cache.set(entry.slug, card);
    return card;
  }
  async function render(focusNew = false) {
    const current = ++revision;
    const matching: Entry[] = filterCatalog(entries, { learning: root.dataset.learning, interest, category, query: search.value });
    const visible = matching.slice(0, limit);
    const previous = grid.children.length;
    more.disabled = true; retry.hidden = true;
    status.textContent = '読み込み中…';
    grid.setAttribute('aria-busy', 'true');
    try {
      const cards = await Promise.all(visible.map(cardFor));
      // 古い検索応答で、新しい検索結果を上書きしない。
      if (current !== revision) return;
      grid.replaceChildren(...cards);
      cards.forEach(card => card.hidden = false);
      root.dataset.ready = 'true';
      more.hidden = visible.length >= matching.length;
      root.querySelector<HTMLElement>('[data-more-container]')!.hidden = false;
      root.querySelector<HTMLElement>('[data-visible-count]')!.textContent = `全${matching.length}件中 ${visible.length}件を表示`;
      root.querySelector<HTMLElement>('[data-count]')!.textContent = `${matching.length}件`;
      status.textContent = matching.length ? '' : '該当する体験がありません。キーワードや条件を変えてみてください。';
      if (focusNew) cards[previous]?.focus({ preventScroll: true });
    } catch {
      if (current !== revision) return;
      status.textContent = '読み込めませんでした。表示中のカードは引き続き利用できます。'; retry.hidden = false;
    } finally {
      if (current === revision) { more.disabled = false; grid.setAttribute('aria-busy', 'false'); }
    }
  }
  function reset() {
    limit = pageSize();
    root.querySelectorAll<HTMLButtonElement>('[data-interest], [data-category-filter]').forEach(button => {
      const selected = button.dataset.interest !== undefined ? button.dataset.interest === interest : button.dataset.categoryFilter === category;
      button.classList.toggle('active', selected); button.setAttribute('aria-pressed', String(selected));
    });
    const selectedTheme = [...root.querySelectorAll<HTMLButtonElement>('[data-interest]')].find(button => button.dataset.interest === interest)?.textContent;
    root.querySelector<HTMLElement>('[data-count-label]')!.textContent = interest !== 'all' ? `${selectedTheme}につながるひと場面` : category !== 'すべて' ? category : 'いろいろな仕事のひと場面';
    void render();
  }
  // 興味と分野は従来通り排他的。キーワードは選択中の分類と組み合わせる。
  root.querySelectorAll<HTMLButtonElement>('[data-interest]').forEach(button => button.addEventListener('click', () => { interest = button.dataset.interest!; category = 'すべて'; reset(); }));
  root.querySelectorAll<HTMLButtonElement>('[data-category-filter]').forEach(button => button.addEventListener('click', () => { category = button.dataset.categoryFilter!; interest = 'all'; reset(); }));
  let searchTimer: ReturnType<typeof setTimeout>;
  search.addEventListener('input', () => {
    clearTimeout(searchTimer);
    ++revision; // 入力直前の通信結果を表示しない。
    searchTimer = setTimeout(reset, 180);
  });
  more.addEventListener('click', () => { limit += pageSize(); void render(true); });
  mobile.addEventListener('change', () => { if (loaded) reset(); });
  retry.addEventListener('click', () => { if (loaded) void render(); else void initialize(); });
  async function initialize() {
    retry.hidden = true;
    try {
      const response = await fetch(root.dataset.indexUrl!, { signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error('Index unavailable');
      entries = await response.json(); loaded = true;
      // 索引の通信中に画面幅が変わった場合も、現在の幅の初期件数に合わせる。
      limit = pageSize();
      root.querySelector<HTMLElement>('.catalog-controls')!.hidden = false;
      await render();
      let legacy = '';
      try { legacy = decodeURIComponent(location.hash.slice(1)); } catch { /* 不正な旧URLを無視 */ }
      if (legacy === 'about') location.replace(sitePath('about/'));
      else if (legacy.startsWith('career/') && entries.some(entry => entry.slug === legacy.slice(7))) location.replace(careerPath(legacy.slice(7)));
      registerTools([
        { name: 'list_careers', description: 'List available career experiences.', inputSchema: { type: 'object', properties: {}, additionalProperties: false }, annotations: { readOnlyHint: true }, execute: () => entries.map(c => ({ id: c.slug, name: c.name, category: c.category })) },
        { name: 'open_career', description: 'Navigate to a career experience.', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'], additionalProperties: false }, annotations: { readOnlyHint: false }, execute: input => {
          const id = (input as { id?: unknown })?.id;
          if (!entries.some(entry => entry.slug === id)) return { error: 'Unknown career ID' };
          const url = careerPath(id as string); location.assign(url); return { navigatingTo: url };
        } },
      ]);
    } catch { status.textContent = '一覧を読み込めませんでした。再試行してください。'; retry.hidden = false; }
  }
  void initialize();
});
