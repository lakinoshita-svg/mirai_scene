import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { parse, parseFragment } from 'parse5';
import { renderActionArrow } from '../src/lib/actionArrows.mjs';

const output = path.resolve(process.env.TEST_DIST || 'dist');
const attribute = (node, name) => node.attrs?.find(attr => attr.name === name)?.value;
const nodes = node => [node, ...(node.childNodes || []).flatMap(nodes)];
const hasClass = (node, name) => (attribute(node, 'class') || '').split(/\s+/).includes(name);
const text = node => node.nodeName === '#text' ? node.value : (node.childNodes || []).map(text).join('');
const read = route => parse(fs.readFileSync(path.join(output, route), 'utf8'));
const htmlFiles = directory => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  const filename = path.join(directory, entry.name);
  return entry.isDirectory() ? htmlFiles(filename) : filename.endsWith('.html') ? [filename] : [];
});

test('shared arrows are decorative, inherit text color and reject undefined variants', () => {
  for (const kind of ['back', 'forward', 'external', 'down']) {
    const svg = parseFragment(renderActionArrow(kind)).childNodes[0];
    assert.equal(svg.tagName, 'svg');
    assert.equal(attribute(svg, 'aria-hidden'), 'true');
    assert.equal(attribute(svg, 'focusable'), 'false');
    assert.equal(attribute(svg, 'stroke'), 'currentColor');
  }
  assert.throws(() => renderActionArrow('unknown'), /未定義/);
});

test('built arrows indicate the action of their enclosing control', () => {
  for (const filename of htmlFiles(output)) {
    const document = parse(fs.readFileSync(filename, 'utf8'));
    for (const arrow of nodes(document).filter(node => attribute(node, 'data-arrow-kind'))) {
      let control = arrow.parentNode;
      while (control && !['a', 'button'].includes(control.tagName)) control = control.parentNode;
      assert.ok(control, `${filename}: arrow needs a link or button`);
      const kind = attribute(arrow, 'data-arrow-kind');
      const opensTab = attribute(control, 'target') === '_blank';
      assert.equal(kind === 'external', opensTab, `${filename}: new-tab arrow must match target`);
      if (kind === 'back') assert.ok(attribute(control, 'data-previous') !== undefined || hasClass(control, 'back'));
      if (kind === 'down') assert.ok(attribute(control, 'href')?.startsWith('#'));
    }
  }
});

test('summary and scene readback controls share one component and preserve navigation hooks', () => {
  const document = read('careers/pastry/index.html');
  const buttons = nodes(document).filter(node => attribute(node, 'data-previous') !== undefined);
  assert.equal(buttons.length, 3);
  assert.equal(buttons.filter(button => text(button).includes('前のシーンを読み返す')).length, 2);
  assert.equal(buttons.filter(button => text(button).includes('最後のシーンを読み返す')).length, 1);
  for (const button of buttons) {
    assert.equal(button.tagName, 'button');
    assert.equal(attribute(button, 'type'), 'button');
    assert.ok(hasClass(button, 'sceneBack'));
    assert.equal(nodes(button).filter(node => attribute(node, 'data-arrow-kind') === 'back').length, 1);
    assert.equal(attribute(button, 'class'), attribute(buttons[0], 'class'));
  }
  const relatedCards = nodes(document).find(node => hasClass(node, 'next-careers'));
  assert.ok(relatedCards);
  assert.equal(nodes(relatedCards).filter(node => attribute(node, 'data-arrow-kind')).length, 0);
  const fields = read('explore/index.html');
  const fieldCards = nodes(fields).find(node => hasClass(node, 'learning-grid'));
  assert.ok(fieldCards);
  assert.equal(nodes(fieldCards).filter(node => attribute(node, 'data-arrow-kind')).length, 0);
});
