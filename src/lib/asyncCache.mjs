/**
 * 同じキーの進行中リクエストを共有する。失敗はキャッシュせず再試行可能にする。
 * @template T
 * @param {(key: string) => Promise<T>} load
 * @param {Map<string, T>} values
 */
export function createAsyncCache(load, values = new Map()) {
  const pending = new Map();
  return async key => {
    if (values.has(key)) return values.get(key);
    if (pending.has(key)) return pending.get(key);
    const request = Promise.resolve().then(() => load(key));
    pending.set(key, request);
    try {
      const value = await request;
      values.set(key, value);
      return value;
    } finally {
      pending.delete(key);
    }
  };
}
