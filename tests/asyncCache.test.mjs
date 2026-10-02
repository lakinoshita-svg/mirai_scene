import test from 'node:test';
import assert from 'node:assert/strict';
import { createAsyncCache } from '../src/lib/asyncCache.mjs';

test('overlapping requests share one fetch and reuse server-rendered cards', async () => {
  let calls = 0;
  let finish;
  const seeded = {slug: 'first'};
  const cache = createAsyncCache(() => {
    calls++;
    return new Promise(resolve => { finish = resolve; });
  }, new Map([['first', seeded]]));
  assert.equal(await cache('first'), seeded);
  const one = cache('next'), two = cache('next');
  await Promise.resolve();
  assert.equal(calls, 1);
  const card = {slug: 'next'};
  finish(card);
  assert.deepEqual(await Promise.all([one, two]), [card, card]);
  assert.equal(await cache('next'), card);
  assert.equal(calls, 1);
});

test('failed shared requests can be retried without poisoning the cache', async () => {
  let calls = 0;
  const cache = createAsyncCache(async () => {
    if (++calls === 1) throw new Error('offline');
    return 'loaded';
  });
  const results = await Promise.allSettled([cache('card'), cache('card')]);
  assert.ok(results.every(result => result.status === 'rejected'));
  assert.equal(await cache('card'), 'loaded');
  assert.equal(calls, 2);
});
