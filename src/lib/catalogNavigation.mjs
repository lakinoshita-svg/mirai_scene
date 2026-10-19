/** 戻り先は同一サービスの一覧だけ。任意URLへの転送には利用しない。 */
export function catalogReturn(value, origin, base) {
  try {
    const url = new URL(value, origin);
    const relative = url.pathname.startsWith(base) ? url.pathname.slice(base.length) : null;
    if (url.origin !== origin || relative === null || (relative !== '' && !/^explore\/[a-z0-9-]+\/$/.test(relative))) return null;
    return url.pathname + url.search + url.hash;
  } catch { return null; }
}
