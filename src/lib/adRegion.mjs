export const regionIds = ['hokkaido', 'tohoku', 'kanto', 'chubu', 'kinki', 'chugoku', 'shikoku', 'kyushu-okinawa'];
const valid = value => value === 'all' || regionIds.includes(value);

// 手動指定（全国を含む）は自動推定より優先する。保存拒否時もメモリ内で利用できる。
export function createRegionResolver({ storage, fetcher = fetch, endpoint = '', timeout = 2500, now = Date.now }) {
    const read = key => { try { return storage?.getItem(key); } catch { return null; } };
    const write = (key, value) => { try { storage?.setItem(key, value); } catch { /* 保存は任意 */ } };
    let manual = read('mirai-ad-region');
    if (!valid(manual)) manual = null;
    let pending;
    const manualResult = () => ({ region: manual, source: 'manual' });
    return {
        choose(region) {
            if (!valid(region)) return;
            manual = region;
            write('mirai-ad-region', region);
        },
        async resolve() {
            if (manual) return manualResult();
            if (!pending) pending = (async () => {
                const fallback = { region: 'all', source: 'default' };
                if (!endpoint) return fallback;
                try {
                    const cached = JSON.parse(read('mirai-ad-region-estimate-v1') || 'null');
                    if (cached && valid(cached.region) && cached.expires > now() && cached.expires <= now() + 1800000)
                        return { region: cached.region, source: cached.region === 'all' ? 'default' : 'estimated' };
                } catch { /* 壊れたキャッシュはAPIで再取得 */ }
                const controller = new AbortController();
                let timer;
                try {
                    // JSONの読み込みも制限時間に含め、広告表示を待たせない。
                    const data = await Promise.race([
                        (async () => {
                            const response = await fetcher(endpoint, { signal: controller.signal, credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer' });
                            if (!response.ok) throw new Error('Region API failed');
                            return response.json();
                        })(),
                        new Promise((_, reject) => { timer = setTimeout(() => { controller.abort(); reject(new Error('Timeout')); }, timeout); }),
                    ]);
                    if (!data || !valid(data.region)) return fallback;
                    write('mirai-ad-region-estimate-v1', JSON.stringify({ region: data.region, expires: now() + 1800000 }));
                    return { region: data.region, source: data.region === 'all' ? 'default' : 'estimated' };
                } catch { return fallback; }
                finally { clearTimeout(timer); }
            })();
            const result = await pending;
            // 通信中に本人が選び直した場合、遅れて届く推定値で上書きしない。
            return manual ? manualResult() : result;
        },
    };
}
