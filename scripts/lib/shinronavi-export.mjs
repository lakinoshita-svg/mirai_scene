import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';
import { parse, serialize, serializeOuter } from 'parse5';
export function scopeCss(css) {
  const root = postcss.parse(css);
  // フォントは進路ナビの共通headに委ね、追加のGoogle Fonts等を読み込まない。
  root.walkAtRules('import', rule => rule.remove());
  root.walkRules(rule => {
    let parent = rule.parent;
    while (parent) { if (parent.type === 'atrule' && /keyframes$/i.test(parent.name)) return; parent = parent.parent; }
    rule.selector = selectorParser(selectors => selectors.each(selector => {
      let rooted = false;
      selector.walk(node => {
        if ((node.type === 'pseudo' && node.value === ':root') || (node.type === 'tag' && ['html','body'].includes(node.value))) {
          node.replaceWith(selectorParser.id({ value: 'mirai-scene' })); rooted = true;
        }
      });
      if (!rooted) { selector.prepend(selectorParser.combinator({ value: ' ' })); selector.prepend(selectorParser.id({ value: 'mirai-scene' })); }
    })).processSync(rule.selector);
  });
  return root.toString();
}
export function extractPage(html) {
  const doc = parse(html, { scriptingEnabled: false });
  const nodes=[];
  function visit(node) { nodes.push(node); (node.childNodes || []).forEach(visit); }
  visit(doc);
  const attr = (node,name) => node.attrs?.find(a=>a.name===name)?.value;
  const main=nodes.find(node=>node.tagName==='main' && attr(node,'id')==='app');
  if (!main) throw new Error('Missing app content');
  const scripts=nodes.filter(node=>node.tagName==='script');
  if(scripts.some(node=>!attr(node,'src') && attr(node,'type')!=='module')) throw new Error('Unexpected inline script type');
  const inlineScripts=scripts.filter(node=>!attr(node,'src')).map(node=>serialize(node));
  const styles=nodes.filter(node=>node.tagName==='style').map(node=>serialize(node));
  const links=nodes.filter(node=>node.tagName==='link' && attr(node,'rel')==='stylesheet').map(node=>attr(node,'href'));
  for(const node of nodes.filter(node=>['script','style'].includes(node.tagName))) {
    node.parentNode.childNodes=node.parentNode.childNodes.filter(child=>child!==node);
  }
  // 本体のmain要素は既存レイアウトが持つ。idとtabindexはフォーカス制御用に維持する。
  main.tagName='div'; main.nodeName='div';
  const title=nodes.find(node=>node.tagName==='title');
  return { html:serializeOuter(main), title:title?.childNodes.map(node=>node.value||'').join('') || 'ミライシーン', description:attr(nodes.find(node=>node.tagName==='meta' && attr(node,'name')==='description') || {},'content') || '', scripts:[...new Set(scripts.map(node=>attr(node,'src')).filter(Boolean))], inlineScripts, styles, links };
}
