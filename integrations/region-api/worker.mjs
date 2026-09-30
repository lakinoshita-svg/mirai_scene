// 都道府県コードを広告用の8地方に丸める。IP・市区町村・緯度経度は返さない。
export function regionFromCf(cf) {
    if (cf?.country !== 'JP') return 'all';
    const code = String(cf.regionCode ?? '').replace(/^JP-/, '');
    if (!/^\d{2}$/.test(code)) return 'all';
    const number = Number(code);
    if (number < 1 || number > 47) return 'all';
    return [[1, 'hokkaido'], [7, 'tohoku'], [14, 'kanto'], [23, 'chubu'], [30, 'kinki'], [35, 'chugoku'], [39, 'shikoku'], [47, 'kyushu-okinawa']].find(([max]) => number <= max)[1];
}

export default {
    async fetch(request, env) {
        const origin = request.headers.get('Origin');
        const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(value => value.trim());
        const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store', 'Vary': 'Origin' };
        if (!origin || !allowed.includes(origin)) return new Response(null, { status: 403, headers });
        headers['Access-Control-Allow-Origin'] = origin;
        if (request.method !== 'GET') return new Response(null, { status: 405, headers: { ...headers, Allow: 'GET' } });
        if (new URL(request.url).pathname !== '/') return new Response(null, { status: 404, headers });
        // Cloudflare側の接続情報だけを使用。クエリや偽装可能な転送ヘッダーは参照しない。
        return new Response(JSON.stringify({ region: regionFromCf(request.cf) }), { headers });
    },
};
