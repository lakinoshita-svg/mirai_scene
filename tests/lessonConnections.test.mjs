import test from 'node:test';
import assert from 'node:assert/strict';
import { createLessonConnections } from '../src/lib/lessonConnections.mjs';

test('Shared lessons combine fields and careers without duplicates and keep editorial order', () => {
  const fields = [
    { id: 'it', label: 'IT', lessons: [{ slug: 'info' }, { slug: 'info' }] },
    { id: 'games', label: 'ゲーム', lessons: [{ slug: 'info' }, { slug: 'games' }] },
  ];
  const careers = [{ slug: 'engineer', name: 'エンジニア', entryTitle: 'つくる', learningIds: ['it', 'games'] }];
  const result = createLessonConnections(fields, careers);
  assert.deepEqual(result.info.fields.map(f => f.id), ['it', 'games']);
  assert.equal(result.info.careers.length, 1);
  assert.equal(result.games.careers[0].slug, 'engineer');
  assert.equal(result.unknown, undefined);
  assert.deepEqual(createLessonConnections(fields).info.careers, []);
});
