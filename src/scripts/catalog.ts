import { sitePath, careerPath } from '../lib/paths';
import { registerTools } from './webmcp';
import { filterCatalog } from '../lib/catalogFilter.mjs';
import { createAsyncCache } from '../lib/asyncCache.mjs';
interface Entry { slug: string; name: string; category: string; cardTheme: string; entryTitle: string; description: string; learningIds: string[] }
document.querySelectorAll<HTMLElement>('[data-catalog]').forEach(root => {
  const grid = root.querySelector<HTMLElement>('#career-grid')!;
  const more = root.querySelector<HTMLButtonElement>('[data-more]')!;
  const retry = root.querySelector<HTMLButtonElement>('[data-retry]')!;
  const status = root.querySelector<HTMLElement>('[data-catalog-status]')!;
  const search = root.querySelector<HTMLInputElement>('[data-search]')!;
  const clear = root.querySelector<HTMLButtonElement>('[data-clear-filters]')!;
  // 一覧の操作で繰り返し使う要素は初期化時に集約。data属性はAstro側との接続契約。
  const controls = root.querySelector<HTMLElement>('.catalog-controls')!;
  const moreContainer = root.querySelector<HTMLElement>('[data-more-container]')!;
  const visibleCount = root.querySelector<HTMLElement>('[data-visible-count]')!;
  const count = root.querySelector<HTMLElement>('[data-count]')!;
  const countLabel = root.querySelector<HTMLElement>('[data-count-label]')!;
  const interestButtons = [...root.querySelectorAll<HTMLButtonElement>('[data-interest]')];
  const categoryButtons = [...root.querySelectorAll<HTMLButtonElement>('[data-category-filter]')];
  const filterButtons = [...interestButtons, ...categoryButtons];
  const mobile = matchMedia('(max-width: 650px)');
  const pageSize = () => mobile.matches ? 8 : 9;
  const cache = new Map<string, HTMLElement>();
  grid.querySelectorAll<HTMLElement>('[data-career]').forEach(card => cache.set(card.dataset.career!, card));
  let entries: Entry[] = [];
  const defaultCategory = root.dataset.defaultCategory || 'すべて';
  let interest = 'all', category = defaultCategory, limit = pageSize(), revision = 0;
  const stateKey = 'miraiSceneCatalog:' + location.pathname;
  const resume = new URLSearchParams(location.search).get('resume');
  let resumed = false;
  function remember() {
    try { sessionStorage.setItem(stateKey, JSON.stringify({interest,category,query:search.value,limit})); } catch { /* 保存できない環境でも閲覧を続ける */ }
  }
  let loaded = false;
  let failed = false;
  let composing = false;
  let searchTimer: ReturnType<typeof setTimeout> | undefined;
  // 最初の9枚以外は必要時に取得。SSRと追加分は同じCareerCardで生成する。
  const cardFor = createAsyncCache(async (slug: string) => {
    const response = await fetch(`${root.dataset.cardBase}${encodeURIComponent(slug)}/`, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error('Card unavailable');
    const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
    const card = doc.querySelector<HTMLElement>('[data-career]');
    if (!card || card.dataset.career !== slug) throw new Error('Invalid card');
    return card;
  }, cache);
  async function render(focusNew = false) {
    const current = ++revision;
    const matching: Entry[] = filterCatalog(entries, { learning: root.dataset.learning, interest, category, query: search.value });
    const visible = matching.slice(0, limit);
    const previous = grid.children.length;
    more.disabled = true; retry.hidden = true;
    status.textContent = '読み込み中…';
    grid.setAttribute('aria-busy', 'true');
    try {
      const results = await Promise.allSettled(visible.map(entry => cardFor(entry.slug)));
      const cards = results.flatMap(result => result.status === 'fulfilled' ? [result.value] : []);
      // 古い検索応答で、新しい検索結果を上書きしない。
      if (current !== revision) return;
      grid.replaceChildren(...cards);
      cards.forEach(card => {
        card.hidden = false;
        const link = card as HTMLAnchorElement;
        const url = new URL(link.href);
        const back = new URL(location.pathname, location.origin);
        back.searchParams.set('resume', card.dataset.career!);
        back.hash = 'experiences';
        url.searchParams.set('returnTo', back.pathname + back.search + back.hash);
        link.href = url.href;
      });
      remember();
      root.dataset.ready = 'true';
      failed = cards.length < visible.length;
      retry.hidden = !failed;
      more.hidden = visible.length >= matching.length;
      moreContainer.hidden = false;
      visibleCount.textContent = `全${matching.length}件中 ${cards.length}件を表示`;
      count.textContent = `${matching.length}件`;
      status.textContent = failed ? '一部の体験を読み込めませんでした。再試行で不足分を読み込めます。' : matching.length ? '' : '該当する体験がありません。キーワードや条件を変えてみてください。';
      if (focusNew) cards[previous]?.focus({ preventScroll: true });
      if (resume && !resumed) {
        const card = cards.find(card => card.dataset.career === resume);
        if (card) { resumed = true; card.focus({preventScroll:true}); card.scrollIntoView({block:'center'}); }
      }
    } catch {
      if (current !== revision) return;
      failed = true;
      status.textContent = '読み込めませんでした。表示中のカードは引き続き利用できます。'; retry.hidden = false;
    } finally {
      // 失敗時は再試行だけを有効にする。もっとみるの連打で表示件数を飛ばさない。
      if (current === revision) { more.disabled = failed; grid.setAttribute('aria-busy', 'false'); }
    }
  }
  function reset(restore = false) {
    clearTimeout(searchTimer);
    if (!restore) limit = pageSize();
    clear.hidden = interest === 'all' && category === defaultCategory && !search.value;
    filterButtons.forEach(button => {
      const selected = button.dataset.interest !== undefined ? button.dataset.interest === interest : button.dataset.categoryFilter === category;
      button.classList.toggle('active', selected); button.setAttribute('aria-pressed', String(selected));
    });
    const selectedTheme = interestButtons.find(button => button.dataset.interest === interest)?.textContent;
    countLabel.textContent = interest !== 'all' ? `${selectedTheme}につながるひと場面` : category !== 'すべて' ? category : root.dataset.learning ? 'この学びにつながる仕事のひと場面' : 'いろいろな仕事のひと場面';
    void render();
  }
  // 興味と分野は従来通り排他的。キーワードは選択中の分類と組み合わせる。
  interestButtons.forEach(button => button.addEventListener('click', () => { interest = button.dataset.interest!; category = defaultCategory; reset(); }));
  categoryButtons.forEach(button => button.addEventListener('click', () => { category = button.dataset.categoryFilter!; interest = 'all'; reset(); }));
  // 日本語変換中は検索を確定せず、確定後に一度だけ更新する。
  search.addEventListener('compositionstart', () => { composing = true; clearTimeout(searchTimer); ++revision; more.disabled = true; });
  search.addEventListener('compositionend', () => { composing = false; reset(); });
  search.addEventListener('input', () => {
    clearTimeout(searchTimer);
    ++revision; // 入力直前の通信結果を表示しない。
    more.disabled = true;
    if (!composing) searchTimer = setTimeout(() => reset(), 180);
  });
  clear.addEventListener('click', () => {
    interest = 'all'; category = defaultCategory; search.value = ''; reset(); search.focus();
  });
  more.addEventListener('click', () => { limit += pageSize(); void render(true); });
  // 画面回転で読み進めた一覧を初期件数へ戻さない。追加分の単位だけPC/SPに合わせる。
  mobile.addEventListener('change', () => { if (loaded) { limit = Math.max(limit, pageSize()); void render(); } });
  retry.addEventListener('click', () => { if (loaded) void render(); else void initialize(); });
  async function initialize() {
    retry.hidden = true;
    try {
      const response = await fetch(root.dataset.indexUrl!, { signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error('Index unavailable');
      const data = await response.json();
      if (!Array.isArray(data) || data.some(entry => typeof entry.slug !== 'string' || !/^[a-z][a-z0-9-]*$/.test(entry.slug) || !['name','category','cardTheme','entryTitle','description'].every(key=>typeof entry[key] === 'string') || !Array.isArray(entry.learningIds))) throw new Error('Invalid index');
      entries = data; loaded = true;
      // 索引の通信中に画面幅が変わった場合も、現在の幅の初期件数に合わせる。
      limit = pageSize();
      if (resume) {
        try {
          const saved = JSON.parse(sessionStorage.getItem(stateKey) || 'null');
          if (saved) {
            interest = interestButtons.some(button=>button.dataset.interest===saved.interest) ? saved.interest : 'all';
            category = categoryButtons.some(button=>button.dataset.categoryFilter===saved.category) ? saved.category : defaultCategory;
            search.value = typeof saved.query === 'string' ? saved.query.slice(0,100) : '';
            limit = Number.isInteger(saved.limit) ? Math.min(entries.length,Math.max(pageSize(),saved.limit)) : pageSize();
          }
        } catch { /* 保存値が不正なら標準の一覧を使う */ }
      }
      controls.hidden = false;
      reset(true);
      // 過去に共有された #career/職業ID と #about を現在のURLへ案内する互換処理。
      let legacyRoute = '';
      try { legacyRoute = decodeURIComponent(location.hash.slice(1)); } catch { /* 不正な旧URLを無視 */ }
      if (legacyRoute === 'about') location.replace(sitePath('about/'));
      else if (legacyRoute.startsWith('career/') && entries.some(entry => entry.slug === legacyRoute.slice(7))) location.replace(careerPath(legacyRoute.slice(7)));
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
