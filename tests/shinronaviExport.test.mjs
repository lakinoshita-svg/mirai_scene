import test from 'node:test';
import assert from 'node:assert/strict';
import { scopeCss, extractPage } from '../scripts/lib/shinronaviExport.mjs';
test('embedded CSS scopes root, generic Tailwind names, nested rules and comma selectors',()=>{
 const css=scopeCss('@import "https://example.test/font.css"; :root{--ink:black}body{margin:0}.grid,a:is(.one,.two){display:block}@media(max-width:650px){h1{font-size:20px}}@keyframes fade{from{opacity:0}to{opacity:1}}');
 assert.ok(!css.includes('@import'));
 for(const selector of ['#mirai-scene{--ink', '#mirai-scene{margin', '#mirai-scene .grid', '#mirai-scene a:is(.one,.two)', '#mirai-scene h1']) assert.ok(css.includes(selector),selector);
 assert.ok(css.includes('from{opacity:0}'));
});
test('export uses body content without duplicate layout and externalizes executable code',()=>{
 const page=extractPage('<html><head><title>A &amp; B</title><style>h1{color:red}</style><script type="module">console.log(1)</script></head><body><header>host duplicate</header><main id="app"><h1>Hello</h1><script type="module" src="/a.js"></script></main><footer>duplicate</footer></body></html>');
 assert.equal(page.title,'A & B');
 assert.ok(page.html.startsWith('<div id="app">'));
 assert.ok(!/script|header|footer|<main/.test(page.html));
 assert.deepEqual(page.scripts,['/a.js']);
 assert.deepEqual(page.inlineScripts,['console.log(1)']);
 assert.deepEqual(page.styles,['h1{color:red}']);
});
